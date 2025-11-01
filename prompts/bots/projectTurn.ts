// prompts/bots/projectTurn.ts
import { MaestroPromptContext } from '../../types';
import {
  getMasterContext,
  getAgentAssignment,
  getAgentMemory,
  getUploadedDocsContext,
  getCurrentObjective,
  getRecentConversation,
  getInstructions,
  WeightProfile
} from './promptComponents';
import { getRoleSpecificGuidance } from './projectRolePrompts';

/**
 * Constructs the complete system prompt for an agent's task in Project Mode.
 */
export const buildProjectTurnPrompt = (context: MaestroPromptContext): string => {
  const {
    mode,
    agent,
    agents,
    userName,
    sessionGoal,
    maestroMemory,
    agentMemory,
    docContext,
    currentMilestone,
    lastTurns
  } = context;
  
  // Define the reasoning weights for Project mode
  const projectWeights: WeightProfile = {
    milestone: 0.4,
    criticalThinking: 0.3,
    innovation: 0.3,
  };
  
  const promptParts: (string | null)[] = [];

  // Assemble the prompt from components
  promptParts.push(getMasterContext(sessionGoal, maestroMemory));
  promptParts.push(getAgentAssignment(agent));
  promptParts.push(getAgentMemory(agent, agentMemory));
  promptParts.push(getUploadedDocsContext(docContext));
  promptParts.push(getCurrentObjective(mode, undefined, currentMilestone));
  promptParts.push(getRoleSpecificGuidance(agent.id));
  promptParts.push(getRecentConversation(lastTurns, agents));
  promptParts.push(getInstructions(projectWeights, userName, agents));

  // Filter out any null parts and join them with a clear separator
  return promptParts.filter(Boolean).join('\n\n---\n\n');
};
