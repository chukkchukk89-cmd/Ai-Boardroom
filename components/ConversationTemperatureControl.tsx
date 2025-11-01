import React, { memo } from 'react';
import { ConversationTemperature } from '../types';

interface ConversationTemperatureControlProps {
  temperature: ConversationTemperature;
  setTemperature: (temp: ConversationTemperature) => void;
}

const options: ConversationTemperature[] = ['Orderly', 'Debate', 'Heated'];

const ConversationTemperatureControlComponent: React.FC<ConversationTemperatureControlProps> = ({ temperature, setTemperature }) => {
  return (
    <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl">
      <div className="mb-2">
        <label className="text-sm font-medium text-white">Conversation Style</label>
        <p className="text-xs text-gray-400">Direct the flow of discussion</p>
      </div>
      <div className="flex bg-gray-900 rounded-lg p-1">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => setTemperature(option)}
            className={`w-full text-center text-sm font-semibold py-1.5 rounded-md transition-all duration-200
              ${temperature === option 
                ? 'bg-purple-600 text-white shadow' 
                : 'text-gray-300 hover:bg-gray-700/50'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ConversationTemperatureControl = memo(ConversationTemperatureControlComponent);