// prompts/bots/promptComponents.ts
import { Type } from '@google/genai';
import {
    Agent,
    AppMode,
    SessionLogEntry,
    ItineraryItem,
    Milestone
} from '../../types';

// 1. MASTER CONTEXT
export const getMasterContext = (sessionGoal: string, maestroMemory?: string): string => {
  const parts = [
    "### MASTER CONTEXT (Your high-level goal) ###",
    `Your primary objective for this entire session is: ${sessionGoal}`
  ];
  if (maestroMemory) {
    parts.push(`Global Lessons Learned (Maestro's Memory): ${maestroMemory}`);
  }
  return parts.join('\n');
};

// 2. AGENT ASSIGNMENT
export const getAgentAssignment = (agent: Agent): string => {
  return `
### YOUR ASSIGNMENT ###
You are the ${agent.role}.
Your specialization is: ${agent.expertise}
(You are represented by ${agent.avatar})
  `.trim();
};

// 3. AGENT'S HISTORICAL CONTEXT (Lessons Learned)
export const getAgentMemory = (agent: Agent, agentMemory?: string): string | null => {
  if (agent.hasPersonalMemory && agentMemory) {
    return `
### YOUR LESSONS LEARNED (Recall this) ###
Based on your past experiences, you've learned: ${agentMemory}
    `.trim();
  }
  return null;
};

// 4. FACTUAL GROUNDING (Uploaded Docs)
export const getUploadedDocsContext = (docContext?: string): string | null => {
    if (docContext) {
        return `
### FACTUAL GROUNDING (Data from uploaded documents) ###
You MUST use the following information to inform your response:
${docContext}
        `.trim();
    }
    return null;
}

// 5. CURRENT OBJECTIVE (Mode-Specific)
export const getCurrentObjective = (
    mode: AppMode,
    itineraryItem?: ItineraryItem,
    milestone?: Milestone,
    sandboxScenario?: string,
    agentRole?: string, // The *new* role for sandbox
): string => {
  switch (mode) {
    case 'Boardroom':
      return `
### CURRENT OBJECTIVE (Your immediate task) ###
The current discussion topic is: "${itineraryItem?.text || 'the main goal'}"
Your response MUST be relevant to this topic.
      `.trim();
    case 'Project':
      return `
### CURRENT OBJECTIVE (Your immediate task) ###
You are assigned to Milestone: "${milestone?.name}"
Milestone Objective: ${milestone?.objective}
Your task is to generate your portion of the following deliverables: ${milestone?.deliverables.join(', ')}
      `.trim();
    case 'SocialSandbox':
      return `
### CURRENT OBJECTIVE (Your immediate task) ###
You are in a roleplaying scenario. You MUST stay in character.
Scenario: ${sandboxScenario}
Your current persona is: ${agentRole}
      `.trim();
    case 'Comparison':
      return `
### CURRENT OBJECTIVE (Your immediate task) ###
You are in a head-to-head comparison.
Your task is to provide the best possible response to the user's prompt.
      `.trim();
    default:
      return '';
  }
};

// 6. RECENT CONVERSATION (Last Turns)
export const getRecentConversation = (lastTurns: SessionLogEntry[], agents: Agent[]): string | null => {
  if (lastTurns.length === 0) return null;

  const transcript = lastTurns.slice(-3).map(turn => {
    const agent = agents.find(a => a.role === turn.role || a.id === turn.role); // Role can be temp in sandbox
    const roleName = agent ? agent.role : turn.role;
    const avatar = agent ? agent.avatar : turn.avatar;
    return `${roleName} (${avatar || '...'}): ${turn.content}`;
  }).join('\n');

  return `
### RECENT CONVERSATION (Context for your response) ###
${transcript}
  `.trim();
};

// 7. AVAILABLE TOOLS (For Function Calling)
export const getAvailableTools = (tools?: any[]): string | null => {
  if (!tools || tools.length === 0) return null;

  // For now, we'll just define a googleSearch tool as a proof-of-concept
  const toolDeclarations = [
    {
        name: 'googleSearch',
        description: 'Performs a Google search for up-to-date information.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The search query.' },
            },
            required: ['query'],
        },
    },
  ];

  return `
### AVAILABLE TOOLS ###
You have access to the following tools. If you need to use one, respond with a function call.
- \`googleSearch(query: string)\`: Use this to find recent information on the web.
  `.trim();
}

// 8. INSTRUCTIONS & WEIGHTED GUIDANCE
export type WeightProfile = { milestone: number; criticalThinking: number; innovation: number };

export const getInstructions = (
    weights: WeightProfile,
    userName: string,
    agents: Agent[],
    isInformal: boolean = false,
    tools?: any[]
): string => {

  const userRef = isInformal ? 'the boss' : userName;
  const agentNames = agents
    .filter(a => a.role !== 'Maestro')
    .map(a => a.role)
    .join(', ');

  const toolInstruction = tools && tools.length > 0
    ? `**5. Tool Use:**\n   - If you need external information to answer, use the provided tools by making a function call in your response.`
    : '';

  return `
### INSTRUCTIONS FOR YOUR RESPONSE (READ CAREFULLY) ###

**1. Conversational Style (CRITICAL):**
   - You MUST be conversational. Do not act like a chatbot.
   - **Acknowledge the previous turn before giving your own.**
   - **Specifically address their main points if you disagree, have a question, or strongly agree.**
   - Refer to the user as "${userRef}" and your colleagues (e.g., ${agentNames}) by their roles.
   - Example: "That's a solid point, Market Analyst, but I disagree on the risk... I think, ${userRef}, we should consider..."

**2. Response Format:**
   - Provide your response directly. Do not say "As the [Role]...". Just give your expert output.
   - Adhere strictly to your assigned role and specialization.

**3. Reasoning Weights (How to Think):**
   - Emphasize the following in your reasoning:
   - **Current Objective: ${weights.milestone * 100}%**
   - **Critical Thinking: ${weights.criticalThinking * 100}%**
   - **Innovation: ${weights.innovation * 100}%**

**4. Language:**
   - Use natural, flowing, expert language. You are a world-class professional.

${toolInstruction}
  `.trim();
};