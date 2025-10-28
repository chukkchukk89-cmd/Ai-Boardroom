// Displays a panel for creating and managing agents.
import React from 'react';
import { AgentConfig } from '../types';
import { AVATARS, MODEL_OPTIONS } from '../constants';

interface AgentCreationPanelProps {
    agentConfigs: AgentConfig[];
    setAgentConfigs: (configs: AgentConfig[]) => void;
    isSessionActive: boolean;
    onApiKeyClick: (provider: string) => void;
}

export const AgentCreationPanel: React.FC<AgentCreationPanelProps> = ({ agentConfigs, setAgentConfigs, isSessionActive, onApiKeyClick }) => {

    const handleUpdate = (id: string, key: keyof AgentConfig, value: any) => {
        setAgentConfigs(agentConfigs.map(ac => ac.id === id ? { ...ac, [key]: value } : ac));
    };

    const handleModelChange = (id: string, provider: string, modelName: string) => {
        const model = MODEL_OPTIONS.find(m => m.provider === provider && m.modelName === modelName);
        if (model) {
            handleUpdate(id, 'model', model);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg flex flex-col gap-4 h-full">
            <h2 className="text-xl font-bold">Agent Team</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                {agentConfigs.map(agent => (
                    <div key={agent.id} className="bg-gray-700 p-3 rounded-md mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <select 
                                value={agent.avatar}
                                onChange={e => handleUpdate(agent.id, 'avatar', e.target.value)} 
                                className="bg-gray-900 text-2xl rounded-md p-1 border-none"
                                disabled={isSessionActive}
                            >
                                {AVATARS.map(ava => <option key={ava} value={ava}>{ava}</option>)}
                            </select>
                            <input 
                                type="text" 
                                value={agent.role} 
                                onChange={e => handleUpdate(agent.id, 'role', e.target.value)} 
                                className="bg-transparent font-bold text-lg w-full ml-2 focus:outline-none"
                                disabled={isSessionActive}
                            />
                        </div>
                        <textarea 
                            value={agent.expertise} 
                            onChange={e => handleUpdate(agent.id, 'expertise', e.target.value)} 
                            className="bg-gray-600 p-2 rounded-md w-full text-sm resize-none focus:outline-none"
                            rows={2}
                            placeholder="Agent's expertise..."
                            disabled={isSessionActive}
                        />
                        <div className="mt-2">
                            <select 
                                value={agent.model.modelName} 
                                onChange={e => handleModelChange(agent.id, agent.model.provider, e.target.value)}
                                className="bg-gray-600 p-2 rounded-md w-full text-sm focus:outline-none"
                                disabled={isSessionActive}
                            >
                                {MODEL_OPTIONS.filter(m => m.provider === agent.model.provider).map(m => 
                                    <option key={m.modelName} value={m.modelName}>{m.modelName}</option>
                                )}
                            </select>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                           <button onClick={() => onApiKeyClick(agent.model.provider)} className="text-blue-400 hover:underline">Set API Key</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};