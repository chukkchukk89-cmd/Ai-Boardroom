// Fix: Create the LoginScreen component.
import React from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Agent Swarm UI</h1>
        <p className="mb-8 text-gray-400">Collaborative AI Agent Simulation</p>
        <button
          onClick={onLogin}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
        >
          Enter
        </button>
      </div>
    </div>
  );
};
