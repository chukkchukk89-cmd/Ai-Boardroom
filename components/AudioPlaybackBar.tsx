// Fix: Creates a functional audio playback component for TTS.
import React from 'react';
import { StopIcon } from './Icons';

interface AudioPlaybackBarProps {
  speaker: { role: string; avatar: string; } | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const AudioPlaybackBar: React.FC<AudioPlaybackBarProps> = ({ speaker, isPlaying, onTogglePlay }) => {
  if (!isPlaying || !speaker) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-3 rounded-full flex items-center gap-4 text-white z-30 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="text-2xl w-8 h-8 flex items-center justify-center">{speaker.avatar}</div>
        <div>
            <p className="text-sm font-semibold">{speaker.role} is speaking...</p>
        </div>
      </div>
      <button onClick={onTogglePlay} className="p-2 w-10 h-10 flex items-center justify-center bg-red-500/80 hover:bg-red-500 rounded-full">
        <StopIcon />
      </button>
    </div>
  );
};
