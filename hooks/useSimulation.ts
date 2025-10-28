// This hook manages the simulation state, including the conversation flow, agent interactions, and text-to-speech.

import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { Agent, AgentConfig, ConversationMessage, UploadedFile } from '../types';
import { playText } from '../utils/tts';

export interface Speaker {
    role: string;
    avatar: string;
}

export const useSimulation = (agents: Agent[], agentConfigs: AgentConfig[], openAiApiKey: string, uploadedFiles: UploadedFile[]) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
    const [prevActiveAgentId, setPrevActiveAgentId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speaker, setSpeaker] = useState<Speaker | null>(null);
    
    const sessionControlRef = useRef({ isRunning: false });
    const audioControlRef = useRef<{ stop: () => void } | null>(null);

    const addMessage = (role: string, content: string) => {
        setMessages(prev => [...prev, { id: uuidv4(), role, content }]);
    };

    const getFileContext = () => uploadedFiles.map(f => `### ${f.name}\n${f.content}`).join('\n\n');

    const startSimulation = (userObjective: string) => {
        setIsSessionActive(true);
        sessionControlRef.current.isRunning = true;
        setMessages([]);
        addMessage('user', userObjective);
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
            const { stop } = await playText(text, speaker, 'YOUR_GOOGLE_TTS_API_KEY', () => setIsPlaying(false));
            audioControlRef.current = { stop };
            setIsPlaying(true);
            setSpeaker(speaker);
        }
    };

    const runSimulation = async (userObjective: string) => {
        const openai = new OpenAI({ apiKey: openAiApiKey, dangerouslyAllowBrowser: true });
        let currentObjective = userObjective;

        while (sessionControlRef.current.isRunning) {
            // 1. Maestro plans the next step
            const maestro = agentConfigs.find(a => a.role === 'Maestro');
            if (!maestro) {
                console.error("Maestro agent not found!");
                stopSimulation();
                return;
            }

            const planResponse = await openai.chat.completions.create({
                model: maestro.model.modelName,
                messages: [
                    { role: 'system', content: `You are a master planner. Your goal is to orchestrate a team of AI agents to achieve the user's objective. The available agents are: ${agentConfigs.map(a => `${a.role} (${a.expertise})`).join(', ')}. Based on the conversation history and the user's objective, determine the next immediate step. This could be a question to the user, a task for a specific agent, or the final answer. Respond with a JSON object with keys "next_agent" and "task". If the goal is complete, next_agent should be "user" and task should be the final response.` },
                    { role: 'user', content: `Objective: ${userObjective}\n\nHistory:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}` }
                ],
                response_format: { type: 'json_object' }
            });

            const { next_agent, task } = JSON.parse(planResponse.choices[0].message.content || '{}');
            currentObjective = task;

            // 2. Execute the step
            if (next_agent === 'user') {
                addMessage('assistant', task);
                stopSimulation();
                return;
            }

            const agent = agentConfigs.find(a => a.role === next_agent);
            if (!agent) {
                console.error(`Agent ${next_agent} not found!`);
                continue;
            }

            setActiveAgentId(agent.id);
            
            const agentResponse = await openai.chat.completions.create({
                model: agent.model.modelName,
                messages: [
                    { role: 'system', content: `You are ${agent.role}, an expert in ${agent.expertise}. Your task is: ${currentObjective}. Here are some relevant files:\n${getFileContext()}` },
                    { role: 'user', content: `History:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}` }
                ]
            });
            
            const responseContent = agentResponse.choices[0].message.content || '';
            addMessage(agent.role, responseContent);
            setPrevActiveAgentId(activeAgentId);
            setActiveAgentId(null);
        }
    };

    return { isSessionActive, messages, activeAgentId, prevActiveAgentId, startSimulation, stopSimulation, toggleAudioPlayback, isPlaying, speaker };
};