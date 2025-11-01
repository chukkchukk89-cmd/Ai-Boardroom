import React from 'react';
import { Agent } from '../types';
import { AgentCard } from './AgentCard';

interface BoardroomPanelProps {
  agents: Agent[];
}

export const BoardroomPanel: React.FC<BoardroomPanelProps> = ({ agents }) => {
  return (
    <div className="h-full w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col">
        <h2 className="text-xl font-bold text-white text-center mb-4 flex-shrink-0">Boardroom Council</h2>
        <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4">
            {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
            ))}
        </div>
    </div>
  );
};