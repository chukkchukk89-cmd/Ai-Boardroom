import React from 'react';

export const ComparisonMode: React.FC = () => {
  return (
    <div className="h-full w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-400">
      <h2 className="text-2xl font-bold text-white mb-4">Comparison Mode</h2>
      <p>An A/B testing arena to compare models and strategies.</p>
      <p className="mt-2 text-sm">(UI for this mode is not yet implemented.)</p>
    </div>
  );
};
