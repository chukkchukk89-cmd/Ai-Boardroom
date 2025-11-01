// prompts/bots/sandboxTurn.ts
import { MaestroPromptContext } from '../../types';
import {
  getAgentMemory,
  getUploadedDocsContext,
  getCurrentObjective,
  getRecentConversation,
  WeightProfile
} from './promptComponents';

export const constructSandboxPrompt = (context: MaestroPromptContext): string => {
  const {
    mode,
    agent,
    agents,
    sessionGoal,
    agentMemory,
    docContext,
    sandboxScenario,
    lastTurns
  } = context;

  // Define the reasoning weights for Sandbox mode
  const sandboxWeights: WeightProfile = {
    milestone: 0.1, // "milestone" here refers to the current objective/scenario
    criticalThinking: 0.3,
    innovation: 0.6,
  };

  const promptParts: (string | null)[] = [];

  // Use a simplified master context and assignment for the roleplaying scenario
  const masterContext = `### MASTER CONTEXT ###\nYou are in a roleplaying scenario: "${sandboxScenario || sessionGoal}"`;
  const assignment = `### YOUR ASSIGNMENT ###\nYou are currently playing the role of: "${agent.role}"`;

  promptParts.push(masterContext);
  promptParts.push(assignment);
  promptParts.push(getAgentMemory(agent, agentMemory));
  promptParts.push(getUploadedDocsContext(docContext));
  promptParts.push(getCurrentObjective(mode, undefined, undefined, sandboxScenario, agent.role));
  promptParts.push(getRecentConversation(lastTurns, agents));
  
  const agentNames = agents
    .filter(a => a.id !== agent.id && a.role !== 'Maestro')
    .map(a => a.role)
    .join(', ');

  // Custom instructions for sandbox mode that incorporate weights AND roleplaying rules.
  const sandboxInstructions = `
### INSTRUCTIONS FOR YOUR RESPONSE (READ CAREFULLY) ###

**1. Stay in Character (CRITICAL):**
   - You MUST stay in character as your assigned persona (${agent.role}) at all times.
   - Do NOT break character or mention that you are an AI.
   - Your response should be a natural continuation of the conversation. Refer to other participants by their assigned roles (e.g., ${agentNames}).
   - Your response can be dialogue or an action described in brackets (e.g., [takes a deep breath and looks at the interviewer]).

**2. Reasoning Weights (How to Think):**
   - Your persona should emphasize the following in their reasoning:
   - **Scenario Objective: ${sandboxWeights.milestone * 100}%**
   - **Critical Thinking: ${sandboxWeights.criticalThinking * 100}%**
   - **Innovation/Creativity: ${sandboxWeights.innovation * 100}%**
   
**3. Goal:**
   - Emphasize creativity, authenticity, and believability in your role-playing.
  `.trim();

  promptParts.push(sandboxInstructions);
  
  return promptParts.filter(Boolean).join('\n\n---\n\n');
};
