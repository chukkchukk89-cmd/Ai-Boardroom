import React from 'react';
import { SparklesIcon, EditIcon, FileIcon } from './Icons';
import { ItineraryItem, Agent } from '../types';
import { MasterPlanPanel } from './MasterPlanPanel';
import { ItineraryPanel } from './ItineraryPanel';

interface BoardroomProps {
  projectGoal: string;
  setProjectGoal: (goal: string) => void;
  itinerary: ItineraryItem[];
  setItinerary: (itinerary: ItineraryItem[]) => void;
  isItinerarySet: boolean;
  finalDocument: string | null;
  isSessionActive: boolean;
  onGenerateItinerary: () => void;
  onAnalyzeHealth: () => void; // New prop for health analysis
  agents: Agent[];
}

export const Boardroom: React.FC<BoardroomProps> = ({
  projectGoal,
  setProjectGoal,
  itinerary,
  setItinerary,
  isItinerarySet,
  finalDocument,
  isSessionActive,
  onGenerateItinerary,
  onAnalyzeHealth,
  agents,
}) => {
  return (
    <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-white text-center">Boardroom</h2>
        <div className="relative mt-2">
          <textarea
            value={projectGoal}
            onChange={(e) => setProjectGoal(e.target.value)}
            placeholder="Define the project goal for the agent swarm..."
            rows={3}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 pr-40 text-gray-200 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
            disabled={isSessionActive || isItinerarySet}
          />
          <button
            onClick={onGenerateItinerary}
            disabled={isSessionActive || isItinerarySet || !projectGoal}
            className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Itinerary</span>
          </button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-white flex items-center gap-2"><EditIcon className="w-5 h-5" /> Meeting Itinerary</h3>
              {isSessionActive && (
                  <button onClick={onAnalyzeHealth} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-2 rounded-md transition-colors">
                      Analyze Health
                  </button>
              )}
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2 bg-gray-900/30 p-2 rounded-lg">
                <ItineraryPanel
                    itinerary={itinerary}
                    setItinerary={setItinerary}
                    isItinerarySet={isItinerarySet}
                    isSessionActive={isSessionActive}
                />
            </div>
        </div>
        <div className="flex flex-col gap-2">
             <h3 className="text-base font-semibold text-white flex items-center gap-2"><FileIcon className="w-5 h-5" /> Document</h3>
            <div className="flex-grow bg-gray-900/30 p-2 rounded-lg overflow-hidden">
                <MasterPlanPanel plan={finalDocument} />
            </div>
        </div>
      </div>
    </div>
  );
};