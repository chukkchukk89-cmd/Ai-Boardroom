// prompts/bots/boardroomTurn.ts
import { MaestroPromptContext } from '../../types';
import {
  getMasterContext,
  getAgentAssignment,
  getAgentMemory,
  getUploadedDocsContext,
  getCurrentObjective,
  getRecentConversation,
  getInstructions,
  getAvailableTools,
  WeightProfile
} from './promptComponents';

export const constructBoardroomPrompt = (context: MaestroPromptContext): string => {
  const {
    mode,
    agent,
    agents,
    userName,
    sessionGoal,
    maestroMemory,
    agentMemory,
    docContext,
    currentItineraryItem,
    lastTurns,
    dynamicWeights, // New: For adaptive reasoning
    tools,
  } = context;

  // Define the default reasoning weights for Boardroom mode
  const defaultBoardroomWeights: WeightProfile = {
    milestone: 0.7,
    criticalThinking: 0.2,
    innovation: 0.1,
  };
  
  // Use dynamic weights if provided, otherwise use the default
  const activeWeights = dynamicWeights || defaultBoardroomWeights;

  const promptParts: (string | null)[] = [];

  // Assemble the prompt from components
  promptParts.push(getMasterContext(sessionGoal, maestroMemory));
  promptParts.push(getAgentAssignment(agent));
  promptParts.push(getAgentMemory(agent, agentMemory));
  promptParts.push(getUploadedDocsContext(docContext));
  promptParts.push(getAvailableTools(tools)); // Support for function calling
  promptParts.push(getCurrentObjective(mode, currentItineraryItem));
  promptParts.push(getRecentConversation(lastTurns, agents));
  promptParts.push(getInstructions(activeWeights, userName, agents, false, tools));

  // Filter out any null parts and join them with a clear separator
  return promptParts.filter(Boolean).join('\n\n---\n\n');
};