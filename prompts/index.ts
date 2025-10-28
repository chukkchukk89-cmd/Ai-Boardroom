/**
 * Central exporter for the AI Boardroom's dynamic prompt system.
 * This file makes it easy to import Maestro's and Bots' prompt
 * logic from a single, clean path.
 */

// --- Maestro's Internal Prompts ---
// These are static templates for Maestro's *own* tasks (generation, synthesis)
export * from './maestro/boardroomPrompts';
export * from './maestro/projectPrompts';
export * from './maestro/sandboxPrompts';
export * from './maestro/commonPrompts';
// Fix: Export planning prompts to resolve import error in App.tsx.
export * from './maestro/planningPrompts';
// Fix: Export interjection evaluation prompt to resolve import error.
export * from './maestro/evaluateInterjectionRequestPrompt';

// --- Bot-Facing Prompt Constructors ---
// These are dynamic functions that *build* prompts for subordinate agents
export * from './bots/boardroomTurn';
export * from './bots/projectTurn';
export * from './bots/sandboxTurn';
export * from './bots/interjectionPrompt';
export * from './bots/projectRolePrompts';