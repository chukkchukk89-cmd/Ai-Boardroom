
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

import { Agent, AgentConfig, AppMode, SessionLogEntry, TimelineEvent, ItineraryItem, ProjectData, UploadedFile, MaestroPromptContext } from './types';
import { generateAgentResponse, AgentLLMResponse } from './maestro/maestroPrompting';
import { runProjectSimulation } from './maestro/runProjectSimulation';
import { MAESTRO_BOARDROOM_PROMPTS, MAESTRO_PLANNING_PROMPTS, MAESTRO_SANDBOX_PROMPTS } from './prompts';

import { LoginScreen } from './components/LoginScreen';
import { ModeTabs } from './components/ModeTabs';
import { AgentCreationPanel } from './components/AgentCreationPanel';
import { SessionLoggingPanel } from './components/SessionLoggingPanel';
import { UserInputBar } from './components/UserInputBar';
import { ConversationalGraphView } from './components/ConversationalGraphView';
import { BoardroomPanel } from './components/BoardroomPanel';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AudioPlaybackBar } from './components/AudioPlaybackBar';
import { Timeline } from './components/Timeline';
import { SessionManagementPanel } from './components/SessionManagementPanel';
import { ModeInfoOverlay } from './components/ModeInfoOverlay';
import { MaestroAdvisoryPanel } from './components/MaestroAdvisoryPanel';
import { Boardroom } from './components/Boardroom';
import { ProjectMode } from './components/ProjectMode';
import { SocialSandbox } from './components/SocialSandbox';
import { ComparisonMode } from './components/ComparisonMode';
import { SessionFilesPanel } from './components/SessionFilesPanel';

import { decodeAudioData } from './utils/audio';
import { getFromCache, setInCache } from './utils/cache';
import { defaultProject } from './data/defaultProject';
import { formatFilesAsContext } from './utils/files';

const App: React.FC = () => {
    // Global App State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeMode, setActiveMode] = useState<AppMode>('Boardroom');
    const [showModeInfo, setShowModeInfo] = useState<AppMode | null>(null);

    // Agent & Session State
    const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([]);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
    const [prevActiveAgentId, setPrevActiveAgentId] = useState<string | null>(null);
    const [sessionGoal, setSessionGoal] = useState('');
    const [finalDocument, setFinalDocument] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const sessionControlRef = useRef({ isRunning: false });

    // Mode-Specific State
    const [advisoryGoal, setAdvisoryGoal] = useState('');
    const [isConsultingMaestro, setIsConsultingMaestro] = useState(false);
    const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
    const [isItinerarySet, setIsItinerarySet] = useState(false);
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [sandboxScenario, setSandboxScenario] = useState('');
    const [isSandboxSetup, setIsSandboxSetup] = useState(false);
    const [analysisSuggestions, setAnalysisSuggestions] = useState<{title: string, prompt: string}[]>([]);
    const [isSuggestingAnalysis, setIsSuggestingAnalysis] = useState(false);


    // Config State
    const [temperature, setTemperature] = useState(0.7);
    const [conversationTemperature, setConversationTemperature] = useState<'Orderly' | 'Debate' | 'Heated'>('Orderly');
    const [outputFormat, setOutputFormat] = useState<'Markdown' | 'JSON' | 'Email'>('Markdown');
    const [apiKeyModalProvider, setApiKeyModalProvider] = useState<string | null>(null);

    // Audio State
    const audioContextRef = useRef<AudioContext | null>(null);
    const [activeAudioEntryId, setActiveAudioEntryId] = useState<string | null>(null);
    const [currentlySpeakingAgent, setCurrentlySpeakingAgent] = useState<{ role: string; avatar: string; } | null>(null);
    const audioQueueRef = useRef<{ audio: string; entryId: string; }[]>([]);
    const isPlayingRef = useRef(false);

    // Effect for one-time initialization
    useEffect(() => {
        const dismissedModes = getFromCache<AppMode[]>('dismissed_mode_info') || [];
        if (!dismissedModes.includes(activeMode)) {
            setShowModeInfo(activeMode);
        }
        // Initialize AudioContext on first user interaction (simulated here)
        document.addEventListener('click', initAudio, { once: true });
        return () => document.removeEventListener('click', initAudio);
    }, []);

    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
    }
    
    // Core Logging Function
    const addLogEntry = (role: string, avatar: string, content: string, audio?: string) => {
        const id = uuidv4();
        const newEntry: SessionLogEntry = { id, timestamp: Date.now(), role, avatar, content, audio };
        setSessionLog(prev => [...prev, newEntry]);
        
        const agent = agents.find(a => a.role === role);
        const type = role === 'User' ? 'user_input' : agent?.role === 'Maestro' ? 'decision' : 'agent_contribution';
        
        const newEvent: TimelineEvent = {
            id: uuidv4(),
            timestamp: newEntry.timestamp,
            type,
            title: role,
            description: content.substring(0, 50) + '...',
            refId: id,
        };
        setTimelineEvents(prev => [...prev, newEvent]);

        if (audio && agent?.voice) {
            audioQueueRef.current.push({ audio, entryId: id });
            processAudioQueue();
        }
    };

    // Audio Playback Logic
    const processAudioQueue = async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
        
        isPlayingRef.current = true;
        const { audio, entryId } = audioQueueRef.current.shift()!;
        
        try {
            if (!audioContextRef.current) initAudio();
            if (!audioContextRef.current) throw new Error("Audio context not available");
            
            const agent = agents.find(a => sessionLog.find(l => l.id === entryId)?.role === a.role);
            if(agent) setCurrentlySpeakingAgent({ role: agent.role, avatar: agent.avatar });
            setActiveAudioEntryId(entryId);

            const decodedBuffer = await decodeAudioData(
                new Uint8Array(atob(audio).split('').map(c => c.charCodeAt(0))),
                audioContextRef.current,
                24000, 1
            );
            const source = audioContextRef.current.createBufferSource();
            source.buffer = decodedBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
            source.onended = () => {
                setActiveAudioEntryId(null);
                setCurrentlySpeakingAgent(null);
                isPlayingRef.current = false;
                processAudioQueue();
            };
        } catch (error) {
            console.error("Error playing audio:", error);
            isPlayingRef.current = false;
            setActiveAudioEntryId(null);
            setCurrentlySpeakingAgent(null);
        }
    };

    const handleStopAudio = () => {
        // This is a simplified stop; a full implementation would need to manage the AudioBufferSourceNode.
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setActiveAudioEntryId(null);
        setCurrentlySpeakingAgent(null);
        console.log("Audio playback stopped.");
    };
    
    // Simulation Control
    const handleStartSession = () => {
        if (agents.length <= 1) {
            alert("Please configure at least one agent besides the Maestro.");
            return;
        }
        
        setFinalDocument(null);
        setSessionLog([]);
        setTimelineEvents([]);
        setIsSessionActive(true);
        sessionControlRef.current.isRunning = true;
        
        addLogEntry('Maestro', '👑', `Session started in ${activeMode} mode. Goal: ${sessionGoal || projectData?.goal || sandboxScenario}`, undefined);

        if (activeMode === 'Boardroom') {
            runBoardroomSimulation();
        } else if (activeMode === 'Project' && projectData) {
            runProjectSimulation(projectData, agents, (update) => {
                if(update.log) addLogEntry(update.log.role, update.log.avatar, update.log.content);
                if(update.agentStatus) setAgents(prev => prev.map(a => a.id === update.agentStatus!.agentId ? { ...a, status: update.agentStatus!.status, currentTask: update.agentStatus!.task } : a));
                if(update.milestoneStatus) setProjectData(prev => prev ? ({ ...prev, milestones: prev.milestones.map(m => m.milestoneId === update.milestoneStatus!.milestoneId ? { ...m, currentStatus: update.milestoneStatus!.status } : m) }) : null);
                if(update.finalDocument) setFinalDocument(update.finalDocument);

            }, sessionControlRef);
        } else if (activeMode === 'SocialSandbox') {
            runSocialSandboxSimulation();
        }
    };

    const handleStopSession = () => {
        setIsSessionActive(false);
        sessionControlRef.current.isRunning = false;
        setActiveAgentId(null);
        setAgents(prev => prev.map(a => ({ ...a, status: 'idle', currentTask: null })));
        addLogEntry('Maestro', '👑', 'Session stopped by user.', undefined);
    };

    // Main Simulation Loop for Boardroom
    const runBoardroomSimulation = async () => {
        const participants = agents.filter(a => a.role !== 'Maestro');
        let lastSpeakerIndex = -1;

        for (const item of itinerary) {
            if (!sessionControlRef.current.isRunning) break;
            
            addLogEntry('Maestro', '👑', `New agenda item: "${item.text}"`, undefined);

            for (let i = 0; i < participants.length; i++) {
                if (!sessionControlRef.current.isRunning) break;
                
                lastSpeakerIndex = (lastSpeakerIndex + 1) % participants.length;
                const currentAgent = participants[lastSpeakerIndex];

                setAgents(prev => prev.map(a => a.id === currentAgent.id ? { ...a, status: 'working', currentTask: item.text } : a));
                setPrevActiveAgentId(activeAgentId);
                setActiveAgentId(currentAgent.id);

                const context: MaestroPromptContext = {
                    mode: 'Boardroom',
                    agent: currentAgent, agents, userName: 'User', sessionGoal,
                    lastTurns: sessionLog.slice(-5),
                    currentItineraryItem: item,
                };
                
                const response: AgentLLMResponse = await generateAgentResponse(context, "Please provide your input on the current topic.", temperature);
                
                addLogEntry(currentAgent.role, currentAgent.avatar, response.text, response.audio);
                setAgents(prev => prev.map(a => a.id === currentAgent.id ? { ...a, status: 'done' } : a));
            }
        }
        
        // Final Synthesis
        if (sessionControlRef.current.isRunning) {
            const maestro = agents.find(a => a.role === 'Maestro')!;
            setAgents(prev => prev.map(a => a.id === maestro.id ? { ...a, status: 'working', currentTask: "Synthesizing Master Plan" } : a));
             const fullTranscript = sessionLog.map(l => `${l.role}: ${l.content}`).join('\n');
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const promptConfig = MAESTRO_BOARDROOM_PROMPTS.FINAL_SYNTHESIS(outputFormat);
            
            const result = await ai.models.generateContent({
                model: maestro.model.modelName,
                contents: `Synthesize the following meeting transcript:\n\n${fullTranscript}`,
                config: {
                    systemInstruction: promptConfig.systemInstruction,
                    temperature,
                    responseMimeType: promptConfig.responseMimeType,
                    responseSchema: promptConfig.schema,
                },
            });

            const doc = result.text;
            setFinalDocument(doc);
            addLogEntry('Maestro', '👑', 'Final document has been generated.', undefined);
        }

        handleStopSession();
    };

     // Main Simulation Loop for Social Sandbox
    const runSocialSandboxSimulation = async () => {
        const participants = agents.filter(a => a.role !== 'Maestro');
        const maestro = agents.find(a => a.role === 'Maestro')!;
        let nextSpeakerRole = participants[0].role; // Start with the first agent

        for (let i = 0; i < 10; i++) { // Limit to 10 turns for now
            if (!sessionControlRef.current.isRunning) break;

            const currentAgent = agents.find(a => a.role === nextSpeakerRole)!;
            
            setAgents(prev => prev.map(a => a.id === currentAgent.id ? { ...a, status: 'working', currentTask: `Responding as ${currentAgent.role}` } : a));
            setPrevActiveAgentId(activeAgentId);
            setActiveAgentId(currentAgent.id);
            
            const context: MaestroPromptContext = {
                mode: 'SocialSandbox',
                agent: currentAgent, agents, userName: 'User', sessionGoal: sandboxScenario,
                lastTurns: sessionLog.slice(-5),
                sandboxScenario,
            };

            const response: AgentLLMResponse = await generateAgentResponse(context, "Continue the conversation.", temperature);
            addLogEntry(currentAgent.role, currentAgent.avatar, response.text, response.audio);
            setAgents(prev => prev.map(a => a.id === currentAgent.id ? { ...a, status: 'done' } : a));

            // Maestro decides who is next
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
             const participantRoles = participants.map(p => p.role);
             const promptConfig = MAESTRO_SANDBOX_PROMPTS.DIRECT_NEXT_SPEAKER;
             const result = await ai.models.generateContent({
                model: maestro.model.modelName,
                contents: `Given the last turn, who should speak next? Participants: ${participantRoles.join(', ')}\n\nTranscript:\n${sessionLog.map(l=>`${l.role}: ${l.content}`).slice(-3).join('\n')}`,
                config: {
                    systemInstruction: promptConfig.systemInstruction,
                    responseMimeType: promptConfig.responseMimeType,
                    responseSchema: promptConfig.schema(participantRoles),
                },
            });
            const { nextSpeaker } = JSON.parse(result.text);
            nextSpeakerRole = nextSpeaker;
        }
        
        handleStopSession();
    };


    const handleUserMessage = (message: string) => {
        addLogEntry('User', '👤', message, undefined);
        // In a more interactive mode, this would trigger an agent response.
    };
    
    // UI Handlers
    const handleLogin = () => setIsLoggedIn(true);
    
    const handleModeChange = (mode: AppMode) => {
        if (isSessionActive) return;
        setActiveMode(mode);
        setSessionGoal('');
        setProjectData(null);
        setItinerary([]);
        setIsItinerarySet(false);
        const dismissedModes = getFromCache<AppMode[]>('dismissed_mode_info') || [];
        if (!dismissedModes.includes(mode)) {
            setShowModeInfo(mode);
        }
    };
    
    const handleModeInfoClose = (dontShowAgain: boolean) => {
        if (dontShowAgain) {
            const dismissed = getFromCache<AppMode[]>('dismissed_mode_info') || [];
            setInCache('dismissed_mode_info', [...dismissed, showModeInfo!]);
        }
        setShowModeInfo(null);
    };

    const handleConsultMaestro = async () => {
        setIsConsultingMaestro(true);
        const maestro = agents.find(a => a.role === 'Maestro') || agentConfigs.find(c => c.role === 'Maestro');
        if (!maestro) {
            alert("Maestro agent not found!");
            setIsConsultingMaestro(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const promptConfig = MAESTRO_PLANNING_PROMPTS.INITIAL_USER_PROMPT_ANALYSIS;
            const result = await ai.models.generateContent({
                model: maestro.model.modelName,
                contents: advisoryGoal,
                config: {
                    systemInstruction: promptConfig.systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: promptConfig.schema,
                },
            });
            
            const { recommendedMode, refinedGoal } = JSON.parse(result.text);
            
            setActiveMode(recommendedMode);
            if(recommendedMode === 'Boardroom') setSessionGoal(refinedGoal);
            if(recommendedMode === 'Project') { setProjectData(defaultProject); setSessionGoal(refinedGoal); }
            if(recommendedMode === 'SocialSandbox') setSandboxScenario(refinedGoal);

        } catch (error) {
            console.error("Error consulting Maestro:", error);
            alert("Maestro had trouble with that request. Please try rephrasing.");
        }
        setIsConsultingMaestro(false);
    };

    const handleGenerateItinerary = async () => {
        const maestro = agents.find(a => a.role === 'Maestro');
        if (!maestro) {
            alert("Maestro agent not found!");
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const promptConfig = MAESTRO_BOARDROOM_PROMPTS.ITINERARY_GENERATION;
            const result = await ai.models.generateContent({
                model: maestro.model.modelName,
                contents: sessionGoal,
                config: {
                    systemInstruction: promptConfig.systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: promptConfig.schema,
                },
            });
            
            const { itinerary: generated } = JSON.parse(result.text);
            setItinerary(generated.map((text: string) => ({ id: uuidv4(), text, completed: false })));
            setIsItinerarySet(true);

        } catch (error) {
            console.error("Error generating itinerary:", error);
        }
    };
    
    const handleSetupSandbox = async () => {
        const maestro = agents.find(a => a.role === 'Maestro');
        const participants = agents.filter(a => a.role !== 'Maestro');
        if (!maestro || participants.length === 0) {
            alert("Maestro and at least one other agent must be configured.");
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const promptConfig = MAESTRO_SANDBOX_PROMPTS.SETUP_SCENARIO;
            const agentList = participants.map(p => ({ id: p.id, role: p.role, expertise: p.expertise }));
            const prompt = `Scenario: "${sandboxScenario}"\n\nAvailable Agents:\n${JSON.stringify(agentList, null, 2)}`;

            const result = await ai.models.generateContent({
                model: maestro.model.modelName,
                contents: prompt,
                config: {
                    systemInstruction: promptConfig.systemInstruction,
                    responseMimeType: promptConfig.responseMimeType,
                    responseSchema: promptConfig.schema,
                },
            });

            const { agentPersonas } = JSON.parse(result.text);
            
            setAgents(prev => prev.map(agent => {
                const persona = agentPersonas.find((p: any) => p.agentId === agent.id);
                return persona ? { ...agent, role: persona.newRole, expertise: persona.personaDescription } : agent;
            }));
            
            setIsSandboxSetup(true);

        } catch (error) {
            console.error("Error setting up sandbox:", error);
        }
    };
    
    const handleSuggestAnalysis = async () => {
        setIsSuggestingAnalysis(true);
        const maestro = agents.find(a => a.role === 'Maestro')!;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const promptConfig = MAESTRO_SANDBOX_PROMPTS.SUGGEST_ANALYSIS;
            const fullTranscript = sessionLog.map(l => `${l.role}: ${l.content}`).join('\n');
            
            const result = await ai.models.generateContent({
                model: maestro.model.modelName,
                contents: fullTranscript,
                config: {
                    systemInstruction: promptConfig.systemInstruction,
                    responseMimeType: promptConfig.responseMimeType,
                    responseSchema: promptConfig.schema,
                },
            });
            const { suggestions } = JSON.parse(result.text);
            setAnalysisSuggestions(suggestions);
        } catch (error) {
            console.error("Error suggesting analysis:", error);
        } finally {
            setIsSuggestingAnalysis(false);
        }
    };
    
    const handleGenerateAnalysis = async (prompt: string) => {
        const maestro = agents.find(a => a.role === 'Maestro')!;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const promptConfig = MAESTRO_SANDBOX_PROMPTS.GENERATE_ANALYSIS;
            const fullTranscript = sessionLog.map(l => `${l.role}: ${l.content}`).join('\n');
            const finalPrompt = `Analysis Prompt: "${prompt}"\n\nFull Transcript:\n${fullTranscript}`;
            
            const result = await ai.models.generateContent({
                model: maestro.model.modelName,
                contents: finalPrompt,
                config: {
                    systemInstruction: promptConfig.systemInstruction,
                },
            });
            setFinalDocument(result.text);
        } catch (error) {
            console.error("Error generating analysis:", error);
        }
    };


    const handleFileUpload = (newFiles: UploadedFile[]) => {
        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    };
    
    const scrollToLogEntry = (refId: string) => {
        document.getElementById(refId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const showAdvisory = !sessionGoal && !projectData && !sandboxScenario;

    return (
        <div className="bg-gray-900 text-white font-sans h-screen flex flex-col p-4 gap-4">
             {showModeInfo && <ModeInfoOverlay mode={showModeInfo} onClose={handleModeInfoClose} />}
             <ApiKeyModal provider={apiKeyModalProvider} onClose={() => setApiKeyModalProvider(null)} />
             <AudioPlaybackBar speaker={currentlySpeakingAgent} isPlaying={!!activeAudioEntryId} onTogglePlay={handleStopAudio} />

            <header className="flex-shrink-0">
                <ModeTabs activeMode={activeMode} onModeChange={handleModeChange} disabled={isSessionActive} />
            </header>

            <main className="flex-grow grid grid-cols-12 grid-rows-6 gap-4 min-h-0">
                <section className="col-span-3 row-span-4">
                    <AgentCreationPanel 
                        setAgents={setAgents}
                        agentConfigs={agentConfigs}
                        setAgentConfigs={setAgentConfigs}
                        isSessionActive={isSessionActive}
                        onApiKeyClick={setApiKeyModalProvider}
                    />
                </section>
                
                <section className="col-span-6 row-span-4 min-h-0">
                   {showAdvisory && <MaestroAdvisoryPanel advisoryGoal={advisoryGoal} setAdvisoryGoal={setAdvisoryGoal} onConsult={handleConsultMaestro} isLoading={isConsultingMaestro}/>}
                   {!showAdvisory && activeMode === 'Boardroom' && <Boardroom 
                        projectGoal={sessionGoal}
                        setProjectGoal={setSessionGoal}
                        itinerary={itinerary}
                        setItinerary={setItinerary}
                        isItinerarySet={isItinerarySet}
                        finalDocument={finalDocument}
                        isSessionActive={isSessionActive}
                        onGenerateItinerary={handleGenerateItinerary}
                        onAnalyzeHealth={() => {}}
                        agents={agents}
                   />}
                   {!showAdvisory && activeMode === 'Project' && <ProjectMode projectData={projectData} agents={agents} finalDocument={finalDocument} />}
                   {!showAdvisory && activeMode === 'SocialSandbox' && <SocialSandbox 
                        scenario={sandboxScenario}
                        setScenario={setSandboxScenario}
                        onSetup={handleSetupSandbox}
                        isSetup={isSandboxSetup}
                        isSessionActive={isSessionActive}
                        agents={agents}
                        agentConfigs={agentConfigs}
                        onSuggestAnalysis={handleSuggestAnalysis}
                        onGenerateAnalysis={handleGenerateAnalysis}
                        analysisSuggestions={analysisSuggestions}
                        isSuggestingAnalysis={isSuggestingAnalysis}
                        finalDocument={finalDocument}
                    />}
                   {activeMode === 'Comparison' && <ComparisonMode />}
                </section>

                <section className="col-span-3 row-span-6 relative">
                    <SessionLoggingPanel log={sessionLog} onAudioPlayback={() => {}} activeAudioEntryId={activeAudioEntryId} containerId="session-log-container" />
                    <Timeline events={timelineEvents} onEventClick={scrollToLogEntry} containerId="session-log-container" />
                </section>

                <section className="col-span-3 row-span-2">
                   <SessionManagementPanel 
                        isSessionActive={isSessionActive}
                        onStart={handleStartSession}
                        onStop={handleStopSession}
                        temperature={temperature}
                        setTemperature={setTemperature}
                        conversationTemperature={conversationTemperature}
                        setConversationTemperature={setConversationTemperature}
                        outputFormat={outputFormat}
                        setOutputFormat={setOutputFormat}
                        activeMode={activeMode}
                        isReady={!!sessionGoal || !!projectData || !!sandboxScenario}
                   />
                </section>

                <section className="col-span-6 row-span-2 min-h-0">
                   <div className="h-full flex flex-col gap-4">
                       <div className="flex-grow min-h-0">
                            <ConversationalGraphView agents={agents} activeAgentId={activeAgentId} prevActiveAgentId={prevActiveAgentId} isLowPowerMode={false} />
                       </div>
                       <div className="flex-shrink-0">
                           <UserInputBar onSendMessage={handleUserMessage} isSessionActive={isSessionActive} />
                       </div>
                   </div>
                </section>
                
                 {/* Re-locating SessionFilesPanel for a better layout, if we decide to use it */}
                {/* <section className="col-span-3 row-span-2">
                    <SessionFilesPanel files={uploadedFiles} onFileUpload={handleFileUpload} onRemoveFile={handleRemoveFile} isSessionActive={isSessionActive} />
                </section> */}

            </main>
        </div>
    );
};

export default App;
