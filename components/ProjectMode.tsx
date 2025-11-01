
import React from 'react';
import { Agent, ProjectData } from '../types';
import { MasterPlanPanel } from './MasterPlanPanel';
import { MilestoneCard } from './MilestoneCard';
import { BookOpenIcon } from './Icons';

interface ProjectModeProps {
  projectData: ProjectData | null;
  agents: Agent[];
  finalDocument: string | null;
}

export const ProjectMode: React.FC<ProjectModeProps> = ({ projectData, agents, finalDocument }) => {
  if (!projectData) {
    return (
      <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500">
        <BookOpenIcon className="w-16 h-16 mb-4" />
        <p>No project loaded.</p>
        <p className="text-sm">Use Maestro's Guidance or load a project to begin.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-white text-center">{projectData.projectName}</h2>
        <p className="text-sm text-gray-400 text-center mt-1">Goal: {projectData.goal}</p>
      </div>

      <div className="flex-grow grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">Project Milestones</h3>
          <div className="flex-grow overflow-y-auto space-y-3 pr-2">
            {projectData.milestones.map(milestone => (
              <MilestoneCard
                key={milestone.milestoneId}
                milestone={milestone}
                allAgents={agents}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex-grow overflow-hidden">
            <MasterPlanPanel plan={finalDocument} />
          </div>
        </div>
      </div>
    </div>
  );
};
