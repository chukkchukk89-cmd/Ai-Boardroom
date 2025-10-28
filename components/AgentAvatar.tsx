// Displays the avatar for an agent.
import React from 'react';
import { Agent } from '../types';

interface AgentAvatarProps {
    agent: Agent;
    isActive: boolean;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ agent, isActive }) => {
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${isActive ? 'bg-blue-500' : 'bg-gray-700'}`}>
            {agent.avatar}
        </div>
    );
};