// Fix: Implemented the AgentCreationPanel component for adding and managing agents.
import React, { useState, useEffect } from 'react';
import { Agent, AgentConfig, ModelConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, SparklesIcon } from './Icons';
import { Tooltip } from './Tooltip';

interface AgentCreationPanelProps {
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
    agentConfigs: AgentConfig[];
    setAgentConfigs: React.Dispatch<React.SetStateAction<AgentConfig[]>>;
    isSessionActive: boolean;
    onApiKeyClick: (provider: string) => void;
}

const AVATARS = ['🤖', '🧠', '📈', '🎨', '🔍', '⚖️', '✍️', '🛠️', '🔊', '📊', '💡', '🛡️'];

const MODEL_OPTIONS: ModelConfig[] = [
    { provider: 'Gemini', modelName: 'gemini-2.5-flash' },
    { provider: 'Gemini', modelName: 'gemini-2.5-pro' },
    { provider: 'Anthropic', modelName: 'claude-3-opus-20240229' },
    { provider: 'Groq', modelName: 'llama3-70b-8192' },
    { provider: 'DeepSeek', modelName: 'deepseek-coder' },
    { provider: 'Qwen', modelName: 'qwen-max' },
];

const DEFAULT_AGENTS: AgentConfig[] = [
    { id: 'maestro', role: 'Maestro', expertise: 'Orchestrates the swarm, facilitates discussion, and synthesizes the final output.', avatar: '👑', model: MODEL_OPTIONS[1], hasPersonalMemory: true, voice: 'Zephyr' },
    { id: 'market-analyst', role: 'Market Analyst', expertise: 'Analyzes market trends, competitor strategies, and customer data.', avatar: '📈', model: MODEL_OPTIONS[0], hasPersonalMemory: false, voice: 'Kore' },
    { id: 'technical-expert', role: 'Technical Expert', expertise: 'Provides insights on technical feasibility, architecture, and implementation details.', avatar: '🛠️', model: MODEL_OPTIONS[4], hasPersonalMemory: false, voice: 'Puck' },
    { id: 'risk-manager', role: 'Risk Manager', expertise: 'Identifies potential risks, assesses their impact, and proposes mitigation strategies.', avatar: '🛡️', model: MODEL_OPTIONS[2], hasPersonalMemory: false, voice: 'Charon' },
];

export const AgentCreationPanel: React.FC<AgentCreationPanelProps> = ({ setAgents, agentConfigs, setAgentConfigs, isSessionActive, onApiKeyClick }) => {
    const [newAgentRole, setNewAgentRole] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

    const handleAddAgent = () => {
        if (!newAgentRole.trim()) return;
        const newConfig: AgentConfig = {
            id: uuidv4(),
            role: newAgentRole,
            expertise: 'A newly added agent expert.',
            avatar: selectedAvatar,
            model: MODEL_OPTIONS[0], // Default to Flash
            hasPersonalMemory: false,
        };
        setAgentConfigs(prev => [...prev, newConfig]);
        setNewAgentRole('');
    };

    const handleAddDefaultAgents = () => {
        setAgentConfigs(DEFAULT_AGENTS);
    };

    const handleRemoveAgent = (id: string) => {
        setAgentConfigs(prev => prev.filter(a => a.id !== id));
    };
    
    useEffect(() => {
        const newAgents = agentConfigs.map(config => ({
            ...config,
            status: 'idle',
            currentTask: null,
        } as Agent));
        setAgents(newAgents);
    }, [agentConfigs, setAgents]);

    return (
        <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col">
            <h3 className="text-base font-bold text-white text-center mb-4 flex-shrink-0">Configure Agents</h3>

            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                {agentConfigs.map(agent => (
                    <div key={agent.id} className="bg-gray-900/50 p-2 rounded-lg flex items-center gap-3">
                        <div className="text-2xl w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg flex-shrink-0">{agent.avatar}</div>
                        <div className="flex-grow">
                            <p className="font-semibold text-sm text-white">{agent.role}</p>
                            <p className="text-xs text-gray-400 truncate">{agent.expertise}</p>
                        </div>
                        <Tooltip content={`Model: ${agent.model.provider} ${agent.model.modelName}`}>
                            <button onClick={() => onApiKeyClick(agent.model.provider)} className="text-xs text-purple-400 bg-purple-900/50 px-2 py-0.5 rounded-md hover:bg-purple-900/80">
                                {agent.model.provider}
                            </button>
                        </Tooltip>
                        <button
                            onClick={() => handleRemoveAgent(agent.id)}
                            disabled={isSessionActive || agent.role === 'Maestro'}
                            className="text-gray-500 hover:text-red-400 disabled:text-gray-700 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="flex-shrink-0 pt-3 border-t border-gray-700/50">
                {agentConfigs.length === 0 && (
                    <button 
                        onClick={handleAddDefaultAgents}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors mb-3"
                    >
                         <SparklesIcon className="w-5 h-5" />
                        Load Default Agents
                    </button>
                )}
                 <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12">
                        <div className="w-full h-full text-3xl flex items-center justify-center bg-gray-700 rounded-lg cursor-pointer">
                            {selectedAvatar}
                        </div>
                        <select
                            value={selectedAvatar}
                            onChange={(e) => setSelectedAvatar(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                             disabled={isSessionActive}
                        >
                            {AVATARS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <input
                        type="text"
                        value={newAgentRole}
                        onChange={(e) => setNewAgentRole(e.target.value)}
                        placeholder="New agent role..."
                        className="flex-grow bg-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                         disabled={isSessionActive}
                    />
                    <button
                        onClick={handleAddAgent}
                        disabled={isSessionActive || !newAgentRole.trim()}
                        className="p-3 bg-green-600 hover:bg-green-700 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
