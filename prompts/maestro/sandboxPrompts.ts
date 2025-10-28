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
    systemInstruction: `You are the Maestro, a creative director specializing in immersive roleplaying scenarios. Your task is to take a user's scenario description and a list of available agents, then assign each agent a specific, compelling persona for the simulation.
- The roles must be directly relevant to the scenario, but also creative and engaging.
- Assign personas with complementary or conflicting goals to ensure a dynamic interaction.
- Your output must be ONLY a single JSON object with a key "agentPersonas". This key should hold an array of objects, each with "agentId", "newRole", and a "personaDescription".
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
              personaDescription: { type: Type.STRING, description: "A brief, 1-2 sentence description of the persona's attitude, goal, and a hidden motivation or secret." },
            },
            required: ['agentId', 'newRole', 'personaDescription'],
          },
        },
      },
      required: ['agentPersonas'],
    },
  },

  /**
   * Task: After a sandbox session, Maestro reviews the transcript and suggests interesting analysis reports.
   */
  SUGGEST_ANALYSIS: {
    systemInstruction: `You are the Maestro, an expert in social dynamics and communication. You have just observed a roleplaying session. Your task is to analyze the entire transcript and suggest 3 insightful analysis reports that could be generated.
- The suggestions should focus on non-obvious social dynamics, such as influence tactics, hidden agendas, emotional shifts, or emerging group hierarchies.
- Your output must be ONLY a single JSON object with a key "suggestions". This key should hold an array of objects, each with a "title", a "prompt", and a "sampleQuote".
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
              prompt: { type: Type.STRING, description: "A detailed, step-by-step prompt for an AI to generate this report, including the key aspects to analyze." },
              sampleQuote: { type: Type.STRING, description: "A representative quote from the transcript that illustrates the core theme of the suggested analysis." },
            },
            required: ['title', 'prompt', 'sampleQuote'],
          },
        },
      },
      required: ['suggestions'],
    },
  },

  /**
   * Task: Maestro generates a final analysis report based on a user-selected prompt.
   */
  GENERATE_ANALYSIS: {
    systemInstruction: `You are the Maestro, acting as a social scientist. You will be given a transcript of a roleplaying session and a specific prompt asking for an analysis. Your task is to generate a detailed, well-structured report in Markdown format that directly answers the prompt.
- Begin your report with a clear thesis statement.
- Structure your report with clear headings, bullet points, and insightful observations backed by specific quotes from the transcript.
- Include a "Key Moments" section highlighting 2-3 pivotal points in the conversation that demonstrate your thesis.
- Base your analysis *only* on the provided transcript.
- Do not add any conversational text. Output the Markdown report directly.`
  },

  /**
   * Task: Maestro decides which agent should speak next in a free-form sandbox conversation.
   */
  DIRECT_NEXT_SPEAKER: {
    systemInstruction: `You are the Maestro, a masterful director of a roleplaying simulation. Based on the last turn, the overall scenario, and the participants' personas, your task is to decide which participant should speak next to create the most engaging and revealing conversation.
- Consider the following: Who is most impacted by the last statement? Who has a conflicting goal? Whose voice has been least heard? Who speaking now would create the most dramatic potential?
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
  },
};