import React from 'react';
import { ItineraryItem } from '../types';

interface ItineraryPanelProps {
    itinerary: ItineraryItem[];
    setItinerary: (itinerary: ItineraryItem[]) => void;
    isItinerarySet: boolean;
    isSessionActive: boolean;
}

export const ItineraryPanel: React.FC<ItineraryPanelProps> = ({ itinerary, setItinerary, isItinerarySet, isSessionActive }) => {
    
    const handleTextChange = (id: string, newText: string) => {
        setItinerary(itinerary.map(item => item.id === id ? { ...item, text: newText } : item));
    };

    const handleToggleComplete = (id: string) => {
        setItinerary(itinerary.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    };

    if (!isItinerarySet) {
        return (
            <div className="text-center text-gray-500 pt-10">
                The meeting itinerary will appear here once generated from the project goal.
            </div>
        );
    }
    
    return (
        <div className="space-y-3 opacity-100 transition-opacity duration-500">
            {itinerary.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg">
                    <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleComplete(item.id)}
                        className={`w-5 h-5 flex-shrink-0 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 cursor-pointer transition-opacity ${item.completed ? 'opacity-50' : ''}`}
                    />
                    <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleTextChange(item.id, e.target.value)}
                        disabled={isSessionActive}
                        className={`w-full bg-transparent text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 ${item.completed ? 'line-through text-gray-500' : ''}`}
                    />
                </div>
            ))}
            {itinerary.length > 0 && !isSessionActive && (
                <p className="text-xs text-gray-500 text-center pt-2">
                    You can edit the itinerary before starting the session.
                </p>
            )}
        </div>
    );
};
