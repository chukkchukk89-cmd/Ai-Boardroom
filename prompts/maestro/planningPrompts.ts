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
- Boardroom: For strategic discussion, debate, and consensus-building. Best for complex decisions.
- Project: For executing a plan with specialized agents working on sequential milestones. Best for content generation and structured tasks.
- SocialSandbox: For roleplaying and simulating conversations.

Your task is to:
1.  Parse the user's goal.
2.  Recommend the *single best mode* to start with.
3.  Rewrite the user's goal into a concise, actionable objective suitable for that mode.
4.  Provide a brief (1-2 sentence) reasoning for your recommendation.
5.  Your output MUST be ONLY a single JSON object. Do not add any conversational text.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        recommendedMode: { type: Type.STRING, enum: ['Boardroom', 'Project', 'SocialSandbox'] },
        refinedGoal: { type: Type.STRING },
        reasoning: { type: Type.STRING },
      },
      required: ["recommendedMode", "refinedGoal", "reasoning"],
    }
  },

  /**
   * Task: Maestro generates a complete, multi-step orchestration plan.
   * This is a more advanced function for a full "Guided Mode" experience.
   */
  ORCHESTRATION_PLAN_GENERATION: {
    systemInstruction: `You are the Maestro, a master strategist. Based on a user's goal and a preliminary discussion, generate a multi-step project plan that may span across different application modes (Boardroom, Project).
- Decompose the high-level goal into a logical sequence of phases.
- For each phase, assign the most appropriate mode ('Boardroom' or 'Project').
- Define a clear, actionable goal for each phase.
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
                        mode: { type: Type.STRING, enum: ['Boardroom', 'Project'] },
                        goal: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ["phase", "mode", "goal", "description"]
                }
            }
        },
        required: ["orchestrationPlan"]
    }
  },
};