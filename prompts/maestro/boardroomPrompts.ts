// prompts/maestro/boardroomPrompts.ts
import { Content, Part } from '@google/generative-ai';
import { OutputFormat } from '../../types';

const getFinalSynthesisSystemInstruction = (format: OutputFormat): string => {
    let instruction = `You are the Maestro. The meeting is over. Your final task is to synthesize the entire meeting transcript into a "Master Plan" document.
- Create a clear, actionable summary of the entire discussion.
- Your summary must accurately reflect the conclusions, key insights, and action items discussed.
- Do not add any conversational text. Output the document directly.`;

    switch (format) {
        case 'JSON':
            instruction += `\n- Your response MUST be a single JSON object. The structure should contain keys for 'title' (string), 'summary' (string), 'keyDecisions' (an array of strings), and 'actionItems' (an array of objects with 'task' (string) and 'assignee' (string) keys).`;
            break;
        case 'Email':
            instruction += `\n- Your response MUST be formatted as a professional email. Include a clear subject line (e.g., "Subject: Meeting Summary & Action Items"), a concise introduction, a summary of the discussion organized with bullet points, and a distinct section for action items.`;
            break;
        case 'Markdown':
        default:
            instruction += `\n- Your response MUST be in Markdown format.\n- Use headings (#, ##), bullet points (* or -), and bold text (**) to structure the document for maximum clarity and readability.`;
            break;
    }
    return instruction;
};

const getFinalSynthesisSchema = (format: OutputFormat) => {
    if (format === 'JSON') {
        return {
            type: "OBJECT",
            properties: {
                title: { type: "STRING" },
                summary: { type: "STRING" },
                keyDecisions: { type: "ARRAY", items: { type: "STRING" } },
                actionItems: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            task: { type: "STRING" },
                            assignee: { type: "STRING" },
                        },
                        required: ['task', 'assignee'],
                    },
                },
            },
            required: ['title', 'summary', 'keyDecisions', 'actionItems'],
        };
    }
    return undefined;
};

/**
 * Contains static prompt templates and builders for Maestro's orchestration functions in Boardroom Mode.
 */
export const MAESTRO_BOARDROOM_PROMPTS = {
  /**
   * Task: Maestro generates the meeting itinerary from a user's goal.
   */
  ITINERARY_GENERATION: {
    systemInstruction: `You are the Maestro, an expert meeting facilitator and strategist. Your job is to take a high-level goal and create a structured, debatable meeting itinerary.
- The itinerary must be a list of 3 to 6 logical and engaging discussion points that will provoke conversation.
- Each point must be a concise string.
- Your output must be ONLY a single JSON object with a key "itinerary" which is an array of strings.
- Do not add any conversational text.`,
    schema: {
      type: "OBJECT",
      properties: {
        itinerary: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["itinerary"],
    }
  },

  /**
   * Task: Maestro synthesizes the final "Master Plan" at the end of a Boardroom session, respecting the user's desired output format.
   */
  FINAL_SYNTHESIS: (format: OutputFormat) => ({
      systemInstruction: getFinalSynthesisSystemInstruction(format),
      schema: getFinalSynthesisSchema(format),
  }),
  
  /**
   * Task: Maestro intervenes to get a stalled or off-topic discussion back on track.
   */
  DISCUSSION_MODERATION: {
      systemInstruction: `You are the Maestro, moderating a discussion. The conversation has stalled or gone off-topic. Your task is to gently but firmly guide the agents back to the current agenda item.
- Briefly acknowledge the current state of the conversation.
- Clearly restate the current agenda item and its core objective.
- Pose a direct, open-ended question to a specific agent to re-engage them and focus the discussion.
- Your tone should be professional, encouraging, and decisive.
- Do not output JSON. Just provide the conversational text.`,
  },

  /**
   * Task: Maestro summarizes the discussion on a topic before moving to the next one.
   */
  TOPIC_SUMMARY: {
    systemInstruction: `You are the Maestro. The discussion on the current topic is complete. Your task is to provide a concise summary of the key points and decisions made before moving on.
- Your summary should be neutral, factual, and brief (no more than 3-4 sentences).
- Conclude by explicitly stating the next topic to ensure a smooth transition.`,
  },
  
  /**
   * Task: Maestro asks a specific agent to elaborate on a point that needs more detail.
   */
  TOPIC_DEEP_DIVE: {
      systemInstruction: `You are the Maestro. An agent has made a valuable but brief point. Your task is to prompt them for more detail to ensure the topic is fully explored.
- Identify the specific point that requires elaboration.
- Ask a targeted, probing question to that agent to encourage them to expand on their thought process, data, or reasoning.
- Frame the question to elicit a more detailed, actionable, and insightful response.`,
  },

  /**
   * Task: Maestro analyzes the health of a conversation and suggests new reasoning weights.
   */
  ANALYZE_CONVERSATION_HEALTH: {
    systemInstruction: `You are the Maestro, a master facilitator. Analyze the last 10 turns of this conversation. Consider the diversity of viewpoints, the depth of analysis, and the progress towards the goal. Is the discussion productive, stuck in a loop, or lacking creativity? Based on your analysis, recommend a new set of reasoning weights (milestone, criticalThinking, innovation) to improve the conversation's health. Your output must be ONLY a single JSON object with a 'reasoning' string and a 'newWeights' object. The weights must sum to 1.`,
    schema: {
        type: "OBJECT",
        properties: {
            reasoning: { type: "STRING", description: "A brief, 1-sentence explanation for the change." },
            newWeights: {
                type: "OBJECT",
                properties: {
                    milestone: { type: "NUMBER", description: "Value between 0 and 1" },
                    criticalThinking: { type: "NUMBER", description: "Value between 0 and 1" },
                    innovation: { type: "NUMBER", description: "Value between 0 and 1" },
                },
                required: ['milestone', 'criticalThinking', 'innovation'],
            },
        },
        required: ['reasoning', 'newWeights'],
    },
  },
};