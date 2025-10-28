// Displays the audio playback bar.
import React from 'react';
import { Speaker } from '../hooks/useSimulation';

interface AudioPlaybackBarProps {
    speaker: Speaker | null;
    isPlaying: boolean;
    onTogglePlay: () => void;
}

export const AudioPlaybackBar: React.FC<AudioPlaybackBarProps> = ({ speaker, isPlaying, onTogglePlay }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-2 flex items-center justify-center gap-4 text-white">
            {speaker && (
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{speaker.avatar}</span>
                    <span className="font-bold">{speaker.role} is speaking...</span>
                </div>
            )}
            <button onClick={onTogglePlay} className="text-2xl">
                {isPlaying ? '❚❚' : '▶'}
            </button>
        </div>
    );
};