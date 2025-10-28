// Displays a modal for entering an API key.
import React from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: string;
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, provider, apiKey, setApiKey }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-bold mb-4">Set API Key for {provider}</h2>
                <input 
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="w-full bg-gray-700 p-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter your ${provider} API key...`}
                />
                <button 
                    onClick={onClose}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                    Save and Close
                </button>
            </div>
        </div>
    );
};