// Fix: Create the TemperatureControl component for adjusting model creativity.
import React, { memo } from 'react';

interface TemperatureControlProps {
  temperature: number;
  setTemperature: (temp: number) => void;
}

const TemperatureControlComponent: React.FC<TemperatureControlProps> = ({ temperature, setTemperature }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl">
      <div className="flex-shrink-0">
        <label htmlFor="temperature" className="text-sm font-medium text-white">Creativity</label>
        <p className="text-xs text-gray-400">Controls randomness</p>
      </div>
      <div className="flex-grow flex items-center gap-2">
        <input
          id="temperature"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-mono text-white w-10 text-right">{temperature.toFixed(2)}</span>
      </div>
    </div>
  );
};

export const TemperatureControl = memo(TemperatureControlComponent);