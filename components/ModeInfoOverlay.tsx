import React, { useState } from 'react';
import { AppMode } from '../types';
import { MODE_INFO } from '../constants';
import { SparklesIcon } from './Icons';

interface ModeInfoOverlayProps {
    mode: AppMode;
    onClose: (dontShowAgain: boolean) => void;
}

export const ModeInfoOverlay: React.FC<ModeInfoOverlayProps> = ({ mode, onClose }) => {
  const info = MODE_INFO[mode];
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  const handleBackgroundClick = () => {
    onClose(false); // Always close without dismissing on background click
  }

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={handleBackgroundClick}
    >
      <div 
        className="bg-gray-800/80 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-2xl p-8 transform transition-all animate-fade-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-white mb-2">{info.title}</h2>
        <p className="text-purple-300 font-semibold mb-6">Welcome to {mode} Mode</p>
        
        <p className="text-gray-300 mb-8">{info.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-white mb-3">Professional Use Cases</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-400 text-sm">
                    {info.pro_cases.map((text, i) => <li key={i}>{text}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-400" />
                    Creative Use Cases
                </h3>
                <ul className="space-y-2 list-disc list-inside text-gray-400 text-sm">
                    {info.creative_cases.map((text, i) => <li key={i}>{text}</li>)}
                </ul>
            </div>
        </div>

        <div className="mt-10 text-center">
          <button 
            onClick={handleClose} 
            className="px-8 py-3 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors text-base font-semibold"
          >
            Enter {mode} Mode
          </button>
        </div>

        <div className="absolute bottom-6 right-8 flex items-center">
            <input
                type="checkbox"
                id="dont-show-again"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600 cursor-pointer"
            />
            <label htmlFor="dont-show-again" className="ml-2 text-sm text-gray-400 cursor-pointer">
                Don't show again
            </label>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};