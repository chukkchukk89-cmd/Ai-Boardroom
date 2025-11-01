import React from 'react';
import { BookOpenIcon } from './Icons';

interface MasterPlanPanelProps {
  plan: string | null;
}

export const MasterPlanPanel: React.FC<MasterPlanPanelProps> = ({ plan }) => {
  return (
    <div className="h-full w-full p-4 flex flex-col">
      <h3 className="text-lg font-bold text-white text-center mb-4 flex-shrink-0">Master Plan</h3>
      <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
        {plan ? (
          <div className="prose prose-invert prose-sm text-gray-300" dangerouslySetInnerHTML={{ __html: plan }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BookOpenIcon className="w-16 h-16 mb-4" />
            <p className="text-center">The Master Plan will be synthesized here as agents complete their tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
};
