// Fix: Create the AgentCard component to display agent information.
import React from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

const statusIndicator: Record<Agent['status'], string> = {
  idle: 'bg-gray-500',
  working: 'bg-blue-500 animate-pulse',
  done: 'bg-purple-500',
  error: 'bg-red-500',
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex flex-col h-full relative overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg">{agent.avatar}</div>
        <div className="flex-grow">
          <h3 className="font-bold text-white">{agent.role}</h3>
          <p className="text-xs text-gray-400">{agent.expertise}</p>
        </div>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${statusIndicator[agent.status]}`} title={`Status: ${agent.status}`}></div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700/50 text-sm text-gray-300 flex-grow min-h-[40px]">
        <p className="font-semibold text-gray-400 text-xs mb-1">Current Task:</p>
        <p>{agent.currentTask || 'Awaiting instructions...'}</p>
      </div>
    </div>
  );
};
