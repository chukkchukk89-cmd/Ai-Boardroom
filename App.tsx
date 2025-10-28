import React, { useState, useCallback } from 'react';
import { AgentCreationPanel } from './components/AgentCreationPanel';
import { ChatView } from './components/ChatView';
import { ControlPanel } from './components/ControlPanel';
import { AgentConfig, UploadedFile } from './types';
import { useSimulation } from './hooks/useSimulation';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_AGENTS } from './config';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AudioPlaybackBar } from './components/AudioPlaybackBar';

const App: React.FC = () => {
    const [agentConfigs, setAgentConfigs] = useLocalStorage<AgentConfig[]>('agentConfigs', DEFAULT_AGENTS);
    const [openAiApiKey, setOpenAiApiKey] = useLocalStorage<string>('openAiApiKey', '');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [userObjective, setUserObjective] = useState<string>('Write a blog post about the future of AI.');
    const [modalProvider, setModalProvider] = useState<string | null>(null);

    const agents = agentConfigs.map(config => ({ ...config, status: 'idle' as const, currentTask: null }));

    const { 
        isSessionActive, 
        messages, 
        activeAgentId, 
        prevActiveAgentId, 
        startSimulation, 
        stopSimulation, 
        toggleAudioPlayback,
        isPlaying,
        speaker
    } = useSimulation(agents, agentConfigs, openAiApiKey, uploadedFiles);

    const handleStart = () => {
        if (!openAiApiKey) {
            alert('Please set your OpenAI API key.');
            return;
        }
        startSimulation(userObjective);
    };

    const handleFileUpload = (files: UploadedFile[]) => {
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleToggleAudio = (text: string) => {
        if(speaker && text) {
            toggleAudioPlayback(text, speaker);
        }
    };

    return (
        <div className="bg-gray-900 text-white font-sans h-screen flex flex-col p-4 gap-4">
            <ApiKeyModal 
                isOpen={!!modalProvider} 
                onClose={() => setModalProvider(null)} 
                provider={modalProvider || ''} 
                apiKey={openAiApiKey} 
                setApiKey={setOpenAiApiKey} 
            />
            <Header />
            <main className="flex-grow grid grid-cols-12 grid-rows-6 gap-4 min-h-0">
                <div className="col-span-3 row-span-6">
                    <AgentCreationPanel 
                        agentConfigs={agentConfigs} 
                        setAgentConfigs={setAgentConfigs} 
                        isSessionActive={isSessionActive} 
                        onApiKeyClick={setModalProvider}                    
                    />
                </div>
                <div className="col-span-9 row-span-6 flex flex-col gap-4">
                   <ChatView 
                        messages={messages} 
                        agents={agents} 
                        activeAgentId={activeAgentId} 
                        prevActiveAgentId={prevActiveAgentId}
                        isSessionActive={isSessionActive}
                        onToggleAudio={handleToggleAudio}
                    />
                    <ControlPanel 
                        userObjective={userObjective}
                        setUserObjective={setUserObjective}
                        isSessionActive={isSessionActive}
                        onStart={handleStart}
                        onStop={stopSimulation}
                        uploadedFiles={uploadedFiles}
                        onFileUpload={handleFileUpload}
                        onRemoveFile={handleRemoveFile}
                    />
                </div>
            </main>
            <AudioPlaybackBar 
                speaker={speaker} 
                isPlaying={isPlaying} 
                onTogglePlay={() => speaker && messages.length > 0 && handleToggleAudio(messages[messages.length-1].content)} 
            />
        </div>
    );
};

export default App;
