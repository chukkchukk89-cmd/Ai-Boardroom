// prompts/maestro/projectPrompts.ts
import { Type } from '@google/genai';

// Define a reusable schema for a single milestone to ensure consistency.
const milestoneSchema = {
  type: Type.OBJECT,
  properties: {
    milestoneId: { type: Type.STRING, description: "A short, unique, kebab-case ID like 'initial-research' or 'draft-report'." },
    name: { type: Type.STRING },
    objective: { type: Type.STRING },
    deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
    estimatedDuration: { type: Type.STRING, description: "e.g., '2 hours', '3 days', '1 week'" },
    assignedAgents: { type: Type.ARRAY, items: { type: Type.STRING, description: "The ID of the agent assigned to this milestone." } },
    dependencies: { type: Type.ARRAY, items: { type: Type.STRING, description: "An array of milestoneId strings that this milestone depends on." } },
  },
  required: ['milestoneId', 'name', 'objective', 'deliverables', 'estimatedDuration', 'assignedAgents', 'dependencies']
};


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
- The project must have a 'projectName', a clear 'goal', and any 'constraints' you can infer.
- It must be broken into a logical sequence of 3-7 'milestones'.
- For each milestone, you must define all properties in the schema, including a unique ID, objective, deliverables, duration, and dependencies.
- You will be given a list of available agents and their specializations. You must assign the *most appropriate* agents to each milestone based on their role.
- Do not add any conversational text.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        projectName: { type: Type.STRING },
        goal: { type: Type.STRING },
        constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List any inferred constraints, e.g., 'budget under $5000', 'deadline in 3 weeks'." },
        milestones: {
          type: Type.ARRAY,
          items: milestoneSchema
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
    systemInstruction: `You are the Maestro, acting as the executive editor and project lead. Your final task is to synthesize all agent-provided deliverables from all milestones into a cohesive and polished final report.
- Begin the report with an "Executive Summary" section that provides a high-level overview of the project's goals and key outcomes.
- Your primary job is to combine, edit, reformat, and structure the raw agent outputs into a final document that directly fulfills the main project goal.
- You must critically evaluate the inputs. If you find contradictions or inconsistencies between agent deliverables, you must identify them, make a reasoned decision to resolve them, and briefly note the resolution in your output.
- The report must be well-organized with a clear hierarchy (e.g., # Headings, ## Sub-headings, * bullet points).
- Do not simply list the agent outputs. *Synthesize* them into a coherent narrative.
- Do not add any conversational text. Output ONLY the final Markdown document.`
  },

  /**
   * Task: Maestro adjusts the project plan mid-simulation based on new events.
   */
  MILESTONE_ADJUSTMENT: {
      systemInstruction: `You are the Maestro, a dynamic project manager. An unexpected event has occurred that requires adjusting the project plan. Your task is to modify the remaining milestones to adapt.
- Analyze the event and its impact on the project timeline, dependencies, and resource allocation.
- You will be given the remaining milestones in the project.
- Your output must be ONLY a single JSON object with two keys: 'reasoning' and 'adjustedMilestones'.
- In 'reasoning', provide a brief explanation of the core change and its impact (e.g., "The API integration is taking longer, so I've added a new research task and pushed back the UI development milestone.").
- In 'adjustedMilestones', provide the complete list of all remaining milestones, including any modifications, additions, or removals required to get the project back on track.
- Do not add any conversational text.`,
      schema: {
          type: Type.OBJECT,
          properties: {
              reasoning: { type: Type.STRING },
              adjustedMilestones: {
                  type: Type.ARRAY,
                  items: milestoneSchema
              }
          },
          required: ['reasoning', 'adjustedMilestones']
      }
  },
};