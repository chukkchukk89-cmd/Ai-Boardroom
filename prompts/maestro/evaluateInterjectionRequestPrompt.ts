/**
 * Logic to build a prompt for Maestro to *evaluate* an agent's interjection request.
 * This determines if the interruption is warranted.
 * [cite: Weighted Response & Memory Reference (Speculative).PDF]
 */
import { Type } from '@google/genai';
import { Agent, SessionLogEntry } from '../../types';

export interface InterjectionEvaluationContext {
  requestingAgent: Agent;
  justification: string; // The 1-2 sentence reason from the agent
  currentSpeaker: Agent;
  currentTopic: string;
}

/**
 * Constructs a system prompt for Maestro to decide on an interjection.
 * The user prompt will be the agent's justification.
 */
export const buildMaestroInterjectionEvaluationPrompt = () => {
  return {
    systemInstruction: `
You are the Maestro, the meeting facilitator. An agent has requested to interrupt the current speaker. Your task is to evaluate this request and decide if it's justified.

**Your Goal:** Maintain a productive and orderly discussion, but allow critical interjections that prevent the conversation from going down a wrong path.

**Evaluation Criteria:**
1.  **Urgency:** Is this something that must be addressed *now*, or can it wait? (e.g., correcting a factual error is urgent; a minor difference of opinion is not).
2.  **Validity:** Does the justification seem sound and relevant to the current topic?

**Your Response:**
You must respond with ONLY a single JSON object with two keys:
1.  "grantInterjection": A boolean (\`true\` or \`false\`).
2.  "maestroResponse": A concise, conversational string explaining your decision (e.g., "Hold that thought, Technical Expert. Market Analyst, please finish your point first." or "A valid point, Risk Manager. Please go ahead.").
    `.trim(),
    schema: {
      type: Type.OBJECT,
      properties: {
        grantInterjection: { type: Type.BOOLEAN },
        maestroResponse: { type: Type.STRING },
      },
      required: ["grantInterjection", "maestroResponse"],
    },
    responseMimeType: 'application/json',
  };
};
