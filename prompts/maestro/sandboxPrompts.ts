



// prompts/maestro/sandboxPrompts.ts
import { Type } from '@google/genai';

/**
 * Contains static prompt templates and builders for Maestro's orchestration functions in Social Sandbox Mode.
 */
export const MAESTRO_SANDBOX_PROMPTS = {
  /**
   * Task: Maestro takes a user's scenario and a list of agents, and assigns them appropriate personas/roles for the simulation.
   */
  SETUP_SCENARIO: {
    systemInstruction: `You are the Maestro, a creative director specializing in roleplaying scenarios. Your task is to take a user's scenario description and a list of available agents, then assign each agent a specific, fitting persona for the simulation.
- The new roles must be directly relevant to the scenario.
- Be creative with the roles. Don't just use their default titles.
- Your output must be ONLY a single JSON object with a key "agentPersonas". This key should hold an array of objects, each with "agentId", "newRole", and a brief "personaDescription".
- Do not add any conversational text.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        agentPersonas: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              agentId: { type: Type.STRING },
              newRole: { type: Type.STRING, description: "The new, specific role for the agent in the scenario." },
              personaDescription: { type: Type.STRING, description: "A brief, 1-sentence description of the persona's attitude or goal." },
            },
            required: ['agentId', 'newRole', 'personaDescription'],
          },
        },
      },
      required: ['agentPersonas'],
    },
    responseMimeType: 'application/json',
  },

  /**
   * Task: After a sandbox session, Maestro reviews the transcript and suggests interesting analysis reports.
   */
  SUGGEST_ANALYSIS: {
    systemInstruction: `You are the Maestro, an expert in social dynamics and communication. You have just observed a roleplaying session. Your task is to analyze the entire transcript and suggest 3 insightful analysis reports that could be generated.
- The suggestions should focus on aspects like communication styles, negotiation tactics, emotional progression, or character consistency.
- Your output must be ONLY a single JSON object with a key "suggestions". This key should hold an array of objects, each with a "title" (the suggested report name) and a "prompt" (the detailed prompt for an AI to generate that report).
- Do not add any conversational text.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short, catchy title for the analysis report." },
              prompt: { type: Type.STRING, description: "A detailed prompt that will be given to an AI to generate this specific report." },
            },
            required: ['title', 'prompt'],
          },
        },
      },
      required: ['suggestions'],
    },
    responseMimeType: 'application/json',
  },

  /**
   * Task: Maestro generates a final analysis report based on a user-selected prompt.
   */
  GENERATE_ANALYSIS: {
    systemInstruction: `You are the Maestro, an expert analyst. You will be given a transcript of a roleplaying session and a specific prompt asking for an analysis. Your task is to generate a detailed, well-structured report in Markdown format that directly answers the prompt.
- Structure your report with clear headings, bullet points, and insightful observations.
- Base your analysis *only* on the provided transcript.
- Do not add any conversational text. Output the Markdown report directly.`
  },

  // Fix: Added the missing DIRECT_NEXT_SPEAKER prompt required by the sandbox simulation logic.
  /**
   * Task: Maestro decides which agent should speak next in a free-form sandbox conversation.
   */
  DIRECT_NEXT_SPEAKER: {
    systemInstruction: `You are the Maestro, moderating a roleplaying simulation. Based on the last turn and the overall scenario, your task is to decide which participant should speak next to keep the conversation flowing naturally and logically.
- Your output must be ONLY a single JSON object with a key "nextSpeaker".
- The value for "nextSpeaker" must be one of the provided participant roles.
- Do not add any conversational text.`,
    schema: (participants: string[]) => ({
      type: Type.OBJECT,
      properties: {
        nextSpeaker: { type: Type.STRING, enum: participants },
      },
      required: ['nextSpeaker'],
    }),
    responseMimeType: 'application/json',
  },
};