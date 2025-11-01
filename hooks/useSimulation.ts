import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentConfig, ConversationMessage, UploadedFile } from '../types';
import { playText } from '../utils/tts';
import { AGENT_API } from '../utils/api'; // Import the new API client

export interface Speaker {
    role: string;
    avatar: string;
    voice: string; // Added voice for TTS
}

// The new hook signature does not need the apiKey
export const useSimulation = (agents: Agent[], agentConfigs: AgentConfig[], uploadedFiles: UploadedFile[]) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
    const [prevActiveAgentId, setPrevActiveAgentId] = useState<string | null>(null); // Keep for potential UI effects
    const [isPlaying, setIsPlaying] = useState(false);
    const [speaker, setSpeaker] = useState<Speaker | null>(null);
    
    const sessionControlRef = useRef({ isRunning: false });
    const audioControlRef = useRef<{ stop: () => void } | null>(null);

    // A new function to add or update messages, useful for streaming
    const addOrUpdateMessage = (id: string, role: string, contentChunk: string) => {
        setMessages(prev => {
            const existingMsgIndex = prev.findIndex(msg => msg.id === id);
            if (existingMsgIndex > -1) {
                // Update existing message
                const updatedMessages = [...prev];
                updatedMessages[existingMsgIndex].content += contentChunk;
                return updatedMessages;
            } else {
                // Add new message
                return [...prev, { id, role, content: contentChunk }];
            }
        });
    };

    const startSimulation = (userObjective: string) => {
        setIsSessionActive(true);
        sessionControlRef.current.isRunning = true;
        setMessages([{ id: uuidv4(), role: 'user', content: userObjective }]);
        runSimulation(userObjective);
    };

    const stopSimulation = () => {
        setIsSessionActive(false);
        sessionControlRef.current.isRunning = false;
        setActiveAgentId(null);
        if (audioControlRef.current) {
            audioControlRef.current.stop();
            setIsPlaying(false);
        }
    };

    const toggleAudioPlayback = async (text: string, speaker: Speaker) => {
        if (isPlaying) {
            if (audioControlRef.current) {
                audioControlRef.current.stop();
            }
            setIsPlaying(false);
        } else {
            // NOTE: The original playText function has a bug (uses Node.js 'Buffer').
            // This call will likely fail until that is fixed.
            // Also, the API key for TTS is hardcoded.
            try {
                const { stop } = await playText(text, speaker, 'YOUR_GOOGLE_TTS_API_KEY', () => setIsPlaying(false));
                audioControlRef.current = { stop };
                setIsPlaying(true);
                setSpeaker(speaker);
            } catch (error) {
                console.error("Audio playback failed:", error);
            }
        }
    };

    // --- REWRITTEN SIMULATION LOGIC ---
    const runSimulation = async (userObjective: string) => {
        const maestro = agents.find(a => a.role === 'Maestro');
        if (!maestro) {
            console.error("Maestro agent not found!");
            stopSimulation();
            return;
        }

        setActiveAgentId(maestro.id); // Show Maestro as "thinking"
        const assistantMessageId = uuidv4();
        
        try {
            // Call the new, secure backend API
            const stream = AGENT_API.runAgentStream(
                maestro.id,
                userObjective,
                agents,
                uploadedFiles
            );

            // The backend will decide which agent speaks. For now, we'll label it 'assistant'.
            const assistantRole = 'assistant'; 
            let firstChunk = true;

            for await (const chunk of stream) {
                if (!sessionControlRef.current.isRunning) break;

                if (chunk.content) {
                    if (firstChunk) {
                        setActiveAgentId(null); // Stop showing Maestro as thinking
                        addOrUpdateMessage(assistantMessageId, assistantRole, chunk.content);
                        firstChunk = false;
                    } else {
                        addOrUpdateMessage(assistantMessageId, assistantRole, chunk.content);
                    }
                }
            }
        } catch (error) {
            console.error("Error during simulation stream:", error);
            addOrUpdateMessage(uuidv4(), 'assistant', 'Sorry, an error occurred while connecting to the backend.');
        } finally {
            if (sessionControlRef.current.isRunning) {
                // Can add logic here to formally end the session if needed
            }
            setActiveAgentId(null);
        }
    };

    return { isSessionActive, messages, activeAgentId, prevActiveAgentId, startSimulation, stopSimulation, toggleAudioPlayback, isPlaying, speaker };
};