import React from 'react';
import { Milestone, Agent, TaskStatus } from '../types';

interface MilestoneCardProps {
  milestone: Milestone;
  allAgents: Agent[];
}

const statusClasses: Record<TaskStatus, { bg: string; border: string; text: string; label: string; }> = {
    pending: { bg: 'bg-gray-700/30', border: 'border-gray-600/80', text: 'text-gray-300', label: 'Pending' },
    todo: { bg: 'bg-gray-600/50', border: 'border-gray-500', text: 'text-gray-300', label: 'To Do' },
    inprogress: { bg: 'bg-blue-600/30', border: 'border-blue-500/80', text: 'text-blue-300', label: 'In Progress' },
    done: { bg: 'bg-green-600/20', border: 'border-green-700/50', text: 'text-green-400', label: 'Done' },
    blocked: { bg: 'bg-red-600/30', border: 'border-red-500/80', text: 'text-red-300', label: 'Blocked' },
};

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, allAgents }) => {
  const statusStyle = statusClasses[milestone.currentStatus] || statusClasses.pending;
  const assignedAgents = allAgents.filter(agent => milestone.assignedAgents.includes(agent.id));

  return (
    <div className={`p-4 rounded-xl border ${statusStyle.border} ${statusStyle.bg} flex flex-col gap-3 transition-all`}>
      <header className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-base text-white">{milestone.name}</h4>
          <p className="text-xs text-gray-400 mt-1">{milestone.objective}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyle.bg.replace('30', '80').replace('20', '80')} ${statusStyle.text} flex-shrink-0`}>
            {statusStyle.label}
        </span>
      </header>

      <div>
        <h5 className="text-xs font-semibold text-gray-300 mb-1.5">Deliverables:</h5>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {milestone.deliverables.map((item, index) => <li key={index} className="ml-2">{item}</li>)}
        </ul>
      </div>
      
      <footer className="pt-3 border-t border-gray-700/50 flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-4">
            <span>Duration: <span className="font-semibold text-gray-300">{milestone.estimatedDuration}</span></span>
            {milestone.dependencies.length > 0 && (
                <div className="flex items-center gap-1">
                    <span>Depends on:</span>
                    {milestone.dependencies.map(dep => (
                       <span key={dep} className="font-mono bg-gray-800 text-purple-300 px-1.5 py-0.5 rounded text-[10px]">{dep.toUpperCase()}</span>
                    ))}
                </div>
            )}
        </div>
        <div className="flex items-center -space-x-2">
            {assignedAgents.map(agent => (
                <div key={agent.id} title={agent.role} className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-sm border-2 border-gray-900">
                    {agent.avatar}
                </div>
            ))}
        </div>
      </footer>
    </div>
  );
};
