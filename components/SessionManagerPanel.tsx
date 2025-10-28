
// Fix: Create the SessionManagerPanel to house session controls and configuration options.
import React from 'react';
import { AppMode, ConversationTemperature, OutputFormat } from '../types';
import { TemperatureControl } from './TemperatureControl';
import { ConversationTemperatureControl } from './ConversationTemperatureControl';
import { OutputFormatControl } from './OutputFormatControl';

interface SessionManagerPanelProps {
  isSessionActive: boolean;
  onStart: () => void;
  onStop: () => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  conversationTemperature: ConversationTemperature;
  setConversationTemperature: (temp: ConversationTemperature) => void;
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;
  activeMode: AppMode;
  isReady: boolean; // Is a goal/project set and ready to start?
}

export const SessionManagerPanel: React.FC<SessionManagerPanelProps> = ({
  isSessionActive,
  onStart,
  onStop,
  temperature,
  setTemperature,
  conversationTemperature,
  setConversationTemperature,
  outputFormat,
  setOutputFormat,
  activeMode,
  isReady,
}) => {
  return (
    <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col gap-4">
      <h3 className="text-base font-bold text-white text-center flex-shrink-0">Session Controls</h3>
      
      <div className="flex-shrink-0">
        {!isSessionActive ? (
          <button
            onClick={onStart}
            disabled={!isReady}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            Stop Session
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 pr-2">
        <TemperatureControl temperature={temperature} setTemperature={setTemperature} />
        {(activeMode === 'Boardroom' || activeMode === 'SocialSandbox') && (
          <ConversationTemperatureControl
            temperature={conversationTemperature}
            setTemperature={setConversationTemperature}
          />
        )}
        {(activeMode === 'Boardroom' || activeMode === 'Project') && (
            <OutputFormatControl format={outputFormat} setFormat={setOutputFormat} />
        )}
      </div>
    </div>
  );
};
