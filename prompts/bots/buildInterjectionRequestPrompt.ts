/**
 * Logic to build a prompt for an agent *requesting* an interjection.
 * This prompt is sent *to* Maestro for evaluation.
 * [cite: Weighted Response & Memory Reference (Speculative).PDF]
 */
import { Agent, SessionLogEntry } from '../../types';

export interface InterjectionRequestContext {
  agent: Agent;
  triggeringTurn: SessionLogEntry;
  coreConstraint: string; // The specific constraint being violated (e.g., "budget")
  relevanceScore: number; // The calculated relevance (e.g., 0.85)
}

/**
 * Constructs a system prompt for an agent to request an interruption.
 * The agent's *user prompt* will be "Justify your interjection."
 */
export const buildInterjectionRequestPrompt = (context: InterjectionRequestContext): string => {
  return `
You are the ${context.agent.role}. You have detected a critical issue in the last statement made by ${context.triggeringTurn.role} that requires an immediate interruption.

Your task is to formulate a *request to interject* to the Maestro. You must justify why this is urgent.

**Statement to Interject:**
"${context.triggeringTurn.content}"

**Your Analysis:**
- **Relevance Score:** ${context.relevanceScore * 100}% (You detected this is highly relevant to your expertise).
- **Core Constraint Violation:** The statement violates the "${context.coreConstraint}" constraint.

**Instructions:**
Formulate a concise, 1-2 sentence justification for the Maestro explaining *why* you must interject *now*.
  `.trim();
};
