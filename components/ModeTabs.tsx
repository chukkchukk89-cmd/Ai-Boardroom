// Fix: Provides tabs to switch between different application modes.
import React from 'react';
import { AppMode } from '../types';

interface ModeTabsProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  // Fix: Add optional disabled prop to allow disabling the tabs.
  disabled?: boolean;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ activeMode, onModeChange, disabled }) => {
  const modes: AppMode[] = ['Boardroom', 'Project', 'SocialSandbox', 'Comparison'];

  return (
    <div className="flex bg-gray-800 rounded-lg p-1 w-full max-w-lg mx-auto border border-gray-700/50">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          disabled={disabled}
          className={`w-full text-center text-sm font-semibold py-2 rounded-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed
            ${activeMode === mode
              ? 'bg-purple-600 text-white shadow'
              : 'text-gray-300 hover:bg-gray-700/50'
            }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
};