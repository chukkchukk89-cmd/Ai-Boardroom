// Fix: Creates a panel to display session logs and handle audio playback.
import React, { useRef, useEffect } from 'react';
import { SessionLogEntry } from '../types';
import { PlayIcon, StopIcon } from './Icons';

interface SessionLoggingPanelProps {
  log: SessionLogEntry[];
  onAudioPlayback: (audio: string, entryId: string) => void;
  activeAudioEntryId: string | null;
  containerId: string;
}

export const SessionLoggingPanel: React.FC<SessionLoggingPanelProps> = ({ log, onAudioPlayback, activeAudioEntryId, containerId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col">
      <h3 className="text-lg font-bold text-white text-center mb-4 flex-shrink-0">Session Log</h3>
      <div id={containerId} ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 pr-2">
        {log.map((entry) => (
          <div key={entry.id} id={entry.id} className="flex items-start gap-3 scroll-mt-4">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-lg flex-shrink-0">
              {entry.avatar}
            </div>
            <div className="flex-grow bg-gray-900/40 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm text-white">{entry.role}</p>
                <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</p>
              </div>
              <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{entry.content}</p>
              {entry.audio && (
                <button 
                  onClick={() => onAudioPlayback(entry.audio!, entry.id)} 
                  className="mt-2 text-purple-400 hover:text-purple-300 flex items-center gap-1 text-xs"
                >
                  {activeAudioEntryId === entry.id ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  {activeAudioEntryId === entry.id ? 'Stop' : 'Play Audio'}
                </button>
              )}
            </div>
          </div>
        ))}
        {log.length === 0 && (
            <div className="text-center text-gray-500 pt-10">Session has not started.</div>
        )}
      </div>
    </div>
  );
};
