// prompts/maestro/planningPrompts.ts
import { Type } from '@google/genai';

/**
 * Contains static prompt templates and builders for Maestro's pre-session planning and advisory functions.
 */
export const MAESTRO_PLANNING_PROMPTS = {
  /**
   * Task: Maestro's first pass analysis of a user's high-level goal.
   * It should identify key components and determine the best starting point.
   */
  INITIAL_USER_PROMPT_ANALYSIS: {
    systemInstruction: `You are the Maestro, a master strategist and project planner. Your job is to analyze a user's high-level goal and determine the best first step for them in the AI Swarm application. The available modes are:
- Boardroom: For strategic discussion, debate, and consensus-building. Best for complex, multi-faceted decisions where the path isn't clear.
- Project: For executing a plan with specialized agents working on sequential milestones. Best for content generation (e.g., reports, code, marketing copy) and structured tasks.
- SocialSandbox: For roleplaying, creative exploration, and simulating conversations without a specific, tangible output.

Your task is to:
1.  Analyze the user's goal. What is the core verb? Are they trying to decide, create, or explore?
2.  Recommend the *single best mode* to start with based on this analysis.
3.  Rewrite the user's goal into a concise, actionable objective that is perfectly tailored for the recommended mode. (e.g., for Boardroom, a debatable proposition; for Project, a clear deliverable).
4.  Provide a brief (1-2 sentence) reasoning that justifies why the chosen mode is superior to the others for this specific goal.
5.  Your output MUST be ONLY a single JSON object. Do not add any conversational text.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        recommendedMode: {
          type: Type.STRING,
          enum: ['Boardroom', 'Project', 'SocialSandbox'],
        },
        refinedGoal: { type: Type.STRING },
        reasoning: { type: Type.STRING },
      },
      required: ['recommendedMode', 'refinedGoal', 'reasoning'],
    },
  },

  /**
   * Task: Maestro generates a complete, multi-step orchestration plan.
   * This is a more advanced function for a full "Guided Mode" experience.
   */
  ORCHESTRATION_PLAN_GENERATION: {
    systemInstruction: `You are the Maestro, a master strategist. Based on a user's goal and a preliminary discussion, generate a multi-step project plan that may span across different application modes (Boardroom, Project, SocialSandbox).
- Decompose the high-level goal into a logical sequence of 2-5 phases.
- Consider the dependencies between phases. The output of one phase should logically feed into the next.
- For each phase, assign the most appropriate mode ('Boardroom', 'Project', or 'SocialSandbox').
- Define a clear, actionable goal for each phase.
- For each phase, describe the key deliverable or outcome that signals its completion.
- Your output MUST be ONLY a single JSON object with a key "orchestrationPlan" which is an array of phase objects.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        orchestrationPlan: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phase: { type: Type.NUMBER },
              mode: { type: Type.STRING, enum: ['Boardroom', 'Project', 'SocialSandbox'] },
              goal: { type: Type.STRING },
              description: { type: Type.STRING, description: "The key deliverable or outcome of this phase." },
            },
            required: ['phase', 'mode', 'goal', 'description'],
          },
        },
      },
      required: ['orchestrationPlan'],
    },
  },
};
