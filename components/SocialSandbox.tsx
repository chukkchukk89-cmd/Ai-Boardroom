import React from 'react';
import { Agent, AgentConfig } from '../types';
import { SparklesIcon } from './Icons';
import { MasterPlanPanel } from './MasterPlanPanel';

interface SocialSandboxProps {
  scenario: string;
  setScenario: (scenario: string) => void;
  onSetup: () => void;
  isSetup: boolean;
  isSessionActive: boolean;
  agents: Agent[];
  agentConfigs: AgentConfig[];
  onSuggestAnalysis: () => void;
  onGenerateAnalysis: (prompt: string) => void;
  analysisSuggestions: { title: string; prompt: string }[];
  isSuggestingAnalysis: boolean;
  finalDocument: string | null;
}

interface PersonaCardProps {
    agent: Agent;
    originalConfig: AgentConfig | undefined;
    isSetup: boolean;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ agent, originalConfig, isSetup }) => {
    const originalRole = originalConfig?.role || agent.role;
    const expertise = originalConfig?.expertise || agent.expertise;
    const currentRole = agent.role;

    return (
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 flex items-start gap-3 transition-all duration-300">
            <div className="text-2xl w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg flex-shrink-0">{agent.avatar}</div>
            <div>
                {isSetup && currentRole !== originalRole ? (
                    <>
                        <h4 className="font-bold text-purple-300">{currentRole}</h4>
                        <p className="text-xs text-gray-400 italic">(as the {originalRole})</p>
                    </>
                ) : (
                    <h4 className="font-bold text-white">{currentRole}</h4>
                )}
                <p className="text-xs text-gray-400 mt-1">{expertise}</p>
            </div>
        </div>
    );
};


export const SocialSandbox: React.FC<SocialSandboxProps> = ({
    scenario,
    setScenario,
    onSetup,
    isSetup,
    isSessionActive,
    agents,
    agentConfigs,
    onSuggestAnalysis,
    onGenerateAnalysis,
    analysisSuggestions,
    isSuggestingAnalysis,
    finalDocument
}) => {
  const participantAgents = agents.filter(a => a.role !== 'Maestro');

  if (finalDocument) {
      return (
          <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col gap-4">
              <MasterPlanPanel plan={finalDocument} />
          </div>
      );
  }

  return (
    <div className="h-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-white text-center">Social Sandbox</h2>
        <div className="relative mt-2">
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="Describe the social simulation scenario. For example: 'A job interview for a software engineer role. The interviewer is skeptical, and the candidate is nervous but competent.'"
            rows={4}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 pr-32 text-gray-200 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
            disabled={isSessionActive || isSetup}
          />
          <button
            onClick={onSetup}
            disabled={isSessionActive || isSetup || !scenario}
            className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Setup</span>
          </button>
        </div>
      </div>
      
      <div className="flex-grow grid grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-white">Participants</h3>
              <div className="space-y-3 overflow-y-auto pr-2 h-full">
                  {participantAgents.length > 0 ? (
                      participantAgents.map(agent => {
                          const originalConfig = agentConfigs.find(c => c.id === agent.id);
                          return <PersonaCard key={agent.id} agent={agent} originalConfig={originalConfig} isSetup={isSetup} />
                      })
                  ) : (
                      <div className="text-center text-gray-500 pt-10">Add agents in the 'Configure Agents' panel to participate.</div>
                  )}
              </div>
          </div>
          <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-white">Post-Session Analysis</h3>
              <div className="bg-gray-900/40 p-4 rounded-lg flex-grow flex flex-col justify-center">
                  {isSetup && !isSessionActive ? (
                      <>
                          {analysisSuggestions.length === 0 ? (
                              <div className="text-center">
                                  <button
                                      onClick={onSuggestAnalysis}
                                      disabled={isSuggestingAnalysis}
                                      className="flex items-center justify-center w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-gray-600"
                                  >
                                      <SparklesIcon className="w-5 h-5" />
                                      <span>{isSuggestingAnalysis ? 'Thinking...' : "Get Insight Suggestions"}</span>
                                  </button>
                                  <p className="text-xs text-gray-500 mt-2">Maestro will review the transcript and suggest insightful reports.</p>
                              </div>
                          ) : (
                              <div className="space-y-2">
                                  <p className="text-sm text-center text-gray-400 mb-3">Maestro suggests:</p>
                                  {analysisSuggestions.map((suggestion, index) => (
                                      <button
                                          key={index}
                                          onClick={() => onGenerateAnalysis(suggestion.prompt)}
                                          className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700/80 rounded-lg transition-colors text-sm"
                                      >
                                          {suggestion.title}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </>
                  ) : (
                      <div className="text-center text-gray-500">
                          <p>Complete a session to enable analysis.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};