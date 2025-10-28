// components/MaestroAdvisoryPanel.tsx
import React from 'react';
import { SparklesIcon } from './Icons';

interface MaestroAdvisoryPanelProps {
  advisoryGoal: string;
  setAdvisoryGoal: (goal: string) => void;
  onConsult: () => void;
  isLoading: boolean;
}

export const MaestroAdvisoryPanel: React.FC<MaestroAdvisoryPanelProps> = ({ advisoryGoal, setAdvisoryGoal, onConsult, isLoading }) => {
  return (
    <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-5xl mb-2 shadow-lg">
        👑
      </div>
      <h2 className="text-2xl font-bold text-white">Start with Maestro's Guidance</h2>
      <p className="text-gray-400 max-w-lg">
        Describe your high-level objective, and Maestro will recommend the best mode and configure the initial session for you.
      </p>
      <div className="w-full max-w-xl relative mt-4">
        <textarea
          value={advisoryGoal}
          onChange={(e) => setAdvisoryGoal(e.target.value)}
          placeholder="e.g., 'Develop a marketing strategy for a new SaaS product' or 'Write a short sci-fi story about a friendly robot'"
          rows={3}
          className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 pr-40 text-gray-200 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={onConsult}
          disabled={isLoading || !advisoryGoal}
          className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="w-5 h-5" />
          <span>{isLoading ? 'Thinking...' : 'Consult'}</span>
        </button>
      </div>
       <p className="text-xs text-gray-500 mt-4">
        Alternatively, you can manually select a mode from the tabs above.
      </p>
    </div>
  );
};