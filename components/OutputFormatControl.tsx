// Fix: Create the OutputFormatControl component for selecting the final output structure.
import React, { memo } from 'react';
import { OutputFormat } from '../types';

interface OutputFormatControlProps {
  format: OutputFormat;
  setFormat: (format: OutputFormat) => void;
}

const options: OutputFormat[] = ['Markdown', 'JSON', 'Email'];

const OutputFormatControlComponent: React.FC<OutputFormatControlProps> = ({ format, setFormat }) => {
  return (
    <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl">
      <div className="mb-2">
        <label className="text-sm font-medium text-white">Final Output Format</label>
        <p className="text-xs text-gray-400">Structure for the final document</p>
      </div>
      <div className="flex bg-gray-900 rounded-lg p-1">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => setFormat(option)}
            className={`w-full text-center text-sm font-semibold py-1.5 rounded-md transition-all duration-200
              ${format === option
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

export const OutputFormatControl = memo(OutputFormatControlComponent);