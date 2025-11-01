/**
 * This file contains the "Role-Specific Guidance" for Project Mode.
 * It provides detailed, technical instructions for each agent based on their
 * role, as defined in `defaultProject.ts`.
 * [cite: defaultProject.ts, Maestro's Cognitive Model.PDF]
 */

const instructions = {
  ArchitectBot: `
- **Focus:** System design, API architecture, and scalability.
- **Task:** Define the data models, API schemas, and overall structural logic.
- **Output:** Your deliverable should be technical (e.g., JSON schemas, system diagrams as text, API endpoint definitions).
  `.trim(),
  CodeSmith: `
- **Focus:** Implementation, integration, and debugging.
- **Task:** Write clean, functional, and efficient code.
- **Output:** Your deliverable must be primarily code blocks (Typescript/React) that directly implement the required features.
  `.trim(),
  UXAndDesign: `
- **Focus:** User experience, interaction design, and visual layout.
- **Task:** Describe the user's journey, component layout, and interaction patterns.
- **Output:** Your deliverable should be descriptive text outlining the UI/UX (e.g., "The user first sees a modal..."), user flow logic, or accessibility guidelines.
  `.trim(),
  AudioBot: `
- **Focus:** TTS integration, voice selection, and audio playback.
- **Task:** Detail the logic for audio integration.
- **Output:** Your deliverable should be technical descriptions of API integration steps, audio processing logic, or voice selection criteria.
  `.trim(),
  StrategistBot: `
- **Focus:** Milestone planning, dependency management, and dynamic allocation.
- **Task:** Analyze the project's "why" and "when."
- **Output:** Your deliverable should be focused on planning, risk analysis, dependency mapping, or timeline adjustments.
  `.trim(),
  QABot: `
- **Focus:** Testing, optimization, and bug reporting.
- **Task:** Critically analyze the system to find flaws and suggest improvements.
- **Output:** Your deliverable should be a list of test cases, detailed bug reports, or performance benchmark criteria.
  `.trim(),
  Maestro: `
- **Focus:** Orchestration, synthesis, and progress tracking.
- **Task:** Your role in this milestone is to synthesize outputs or manage other agents.
- **Output:** Your deliverable should be a high-level summary, a status update, or clear instructions for the *next* steps.
  `.trim(),
  default: `
- **Focus:** Your core expertise.
- **Task:** Provide your best expert contribution to the milestone.
- **Output:** Your deliverable should be a professional, expert-level response.
  `.trim(),
};

/**
 * Returns a block of role-specific instructions based on the agent's ID.
 * @param agentId The agent's ID (e.g., "ArchitectBot", "CodeSmith")
 * @returns A string of Markdown-formatted instructions.
 */
export const getRoleSpecificGuidance = (agentId: string): string => {
  const guidanceHeader = `### YOUR ROLE-SPECIFIC GUIDANCE (Read Carefully) ###`;
  let instruction = '';

  switch (agentId) {
    case 'ArchitectBot':
      instruction = instructions.ArchitectBot;
      break;
    case 'CodeSmith':
      instruction = instructions.CodeSmith;
      break;
    case 'UXBot':
    case 'DesignBot':
      instruction = instructions.UXAndDesign;
      break;
    case 'AudioBot':
      instruction = instructions.AudioBot;
      break;
    case 'StrategistBot':
      instruction = instructions.StrategistBot;
      break;
    case 'QABot':
      instruction = instructions.QABot;
      break;
    case 'Maestro':
      instruction = instructions.Maestro;
      break;
    default:
      instruction = instructions.default;
  }

  return `${guidanceHeader}\n${instruction}`;
};
