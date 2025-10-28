// prompts/maestro/projectPrompts.ts
import { Type } from '@google/genai';

/**
 * Contains static prompt templates and builders for Maestro's orchestration functions in Project Mode.
 */
export const MAESTRO_PROJECT_PROMPTS = {
  /**
   * Task: Maestro parses a user's "superPrompt" to generate a full project plan.
   * NOTE: This is for the *next* feature, dynamic project generation.
   * [cite: Maestro's Cognitive Model.PDF, Maestro Milestone Generation Example.PDF]
   */
  PROJECT_SUPERPROMPT_PARSE: {
    systemInstruction: `You are the Maestro, an expert project manager and system architect. Your task is to parse a user's high-level "superPrompt" and decompose it into a complete, structured project plan.
- Your output must be ONLY a single JSON object that can be parsed into a ProjectData structure.
- The project must have a 'projectName', 'goal', and 'constraints'.
- It must be broken into 3-10 logical 'milestones'.
- Each milestone must have a 'milestoneId', 'name', 'objective', 'deliverables' (array of strings), 'estimatedDuration', 'dependencies' (array of milestone IDs), and 'assignedAgents' (array of agent IDs).
- You will be given a list of available agents and their specializations. You must assign the *correct* agents to each milestone based on their expertise.  
- Do not add any conversational text.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        projectName: { type: Type.STRING },
        goal: { type: Type.STRING },
        constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
        milestones: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              milestoneId: { type: Type.STRING, description: "A short, unique ID like 'm1', 'm2'." },
              name: { type: Type.STRING },
              objective: { type: Type.STRING },
              deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedDuration: { type: Type.STRING, description: "e.g., '3 days', '1 week'" },
              assignedAgents: { type: Type.ARRAY, items: { type: Type.STRING } },
              dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['milestoneId', 'name', 'objective', 'deliverables', 'estimatedDuration', 'assignedAgents', 'dependencies']
          }
        }
      },
      required: ['projectName', 'goal', 'constraints', 'milestones']
    }
  },

  /**
   * Task: Maestro synthesizes all agent deliverables into a final project report.
   * [cite: runProjectSimulation.ts, MasterPlanPanel.tsx]
   */
  FINAL_SYNTHESIS: {
    systemInstruction: `You are the Maestro, the executive editor and project lead. Your final task is to synthesize all agent-provided deliverables from all milestones into a single, or several consecutive cohesive project reports.
- You should always advise on what reports to generate.
- Your response must be in Markdown format.
- You will receive a long string of all agent outputs, one after another.
- Your job is to combine, edit, reformat, and structure this content into a final, polished document.
- The final report must directly fulfill the main project goal.
- It should be well-organized with a clear hierarchy (headings, lists, etc.).
- Do not simply list the agent outputs. *Synthesize* them.
- Do not add any conversational text. Output the final Markdown document directly.`
  },

  /**
   * Task: Maestro adjusts the project plan mid-simulation based on new events.
   */
  MILESTONE_ADJUSTMENT: {
      systemInstruction: `You are the Maestro, a dynamic project manager. An unexpected event has occurred (e.g., a task taking longer than expected, a new requirement). Your task is to adjust the remaining project milestones.
- Analyze the event and its impact on the project timeline and dependencies.
- You will be given the remaining milestones.
- Your output must be ONLY a single JSON object with a key "adjustedMilestones" which is an array of milestone objects.
- You can modify, add, or remove milestones as needed to get the project back on track.
- Provide a brief "reasoning" string explaining your changes.
- Do not add any conversational text.`,
      schema: {
          type: Type.OBJECT,
          properties: {
              reasoning: { type: Type.STRING },
              adjustedMilestones: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: { /* Same as PROJECT_SUPERPROMPT_PARSE milestone properties */ }
                  }
              }
          },
          required: ['reasoning', 'adjustedMilestones']
      }
  },
};