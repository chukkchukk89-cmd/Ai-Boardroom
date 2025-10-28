import React from 'react';
import { Task, Agent } from '../types';

interface TaskCardProps {
  task: Task;
  agent?: Agent;
}

const statusClasses: Record<Task['status'], { bg: string; text: string; label: string; }> = {
    todo: { bg: 'bg-gray-600/50', text: 'text-gray-300', label: 'To Do' },
    inprogress: { bg: 'bg-blue-600/50', text: 'text-blue-300 animate-pulse', label: 'In Progress' },
    done: { bg: 'bg-green-600/50', text: 'text-green-300', label: 'Done' },
    blocked: { bg: 'bg-red-600/50', text: 'text-red-300', label: 'Blocked' },
    // Fix: Add 'pending' status to match the TaskStatus type.
    pending: { bg: 'bg-gray-700/50', text: 'text-gray-300', label: 'Pending' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, agent }) => {
  const statusStyle = statusClasses[task.status];

  return (
    <div className={`p-3 rounded-lg border border-gray-700/80 ${statusStyle.bg}`}>
      <h4 className="font-bold text-sm text-white">{task.title}</h4>
      <p className="text-xs text-gray-400 mt-1 mb-2">{task.description}</p>
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          {agent && (
            <>
              <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-xs">{agent.avatar}</div>
              <span className="text-gray-300">{agent.role}</span>
            </>
          )}
          {!agent && <span className="text-gray-500">Unassigned</span>}
        </div>
        <span className={`font-semibold px-2 py-0.5 rounded-full ${statusStyle.text} ${statusStyle.bg}`}>{statusStyle.label}</span>
      </div>
    </div>
  );
};
