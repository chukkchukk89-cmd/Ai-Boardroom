// Displays the application header.
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="flex-shrink-0 flex items-center justify-between">
            <h1 className="text-2xl font-bold">AgentForge</h1>
            <div className="flex items-center gap-4">
                <a href="https://github.com/YourRepo/AgentForge" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">GitHub</a>
            </div>
        </header>
    );
};