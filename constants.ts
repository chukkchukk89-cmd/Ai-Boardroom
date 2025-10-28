import { AppMode, ModelConfig } from './types';

export const VOICE_OPTIONS = [
  { value: 'Kore', name: 'Kore (Female)' },
  { value: 'Puck', name: 'Puck (Male)' },
  { value: 'Charon', name: 'Charon (Male)' },
  { value: 'Fenrir', name: 'Fenrir (Male)' },
  { value: 'Zephyr', name: 'Zephyr (Female)' },
];

export const AVATARS = ['👑', '🧐', '💻', '🤖', '🧠', '🚀', '💡'];

export const MODEL_OPTIONS: ModelConfig[] = [
    { provider: 'OpenAI', modelName: 'gpt-4-turbo-preview' },
    { provider: 'OpenAI', modelName: 'gpt-3.5-turbo' },
    { provider: 'Google', modelName: 'gemini-pro' },
];

export const MODE_INFO: Record<AppMode, { title: string; description: string; pro_cases: string[]; creative_cases: string[] }> = {
  Boardroom: {
    title: "The Strategic Council",
    description: "Boardroom Mode simulates a high-stakes, consensus-driven meeting. Agents speak sequentially, with each required to validate or critique the previous statement. The Maestro guides the structured debate towards a final, actionable recommendation. This mode prioritizes reliability, critical thinking, and auditable decision-making.",
    pro_cases: [
      "Conducting a SWOT analysis for a new product.",
      "Debating the pros and cons of a potential merger or acquisition.",
      "Formulating a crisis response plan.",
      "Reviewing and stress-testing a financial forecast."
    ],
    creative_cases: [
      "Deciding, with absolute certainty, what toppings to get on the team pizza.",
      "Planning a Dungeons & Dragons campaign where each bot represents a conflicting character alignment.",
      "Debating whether a hot dog is a sandwich, with a final, binding ruling."
    ]
  },
  Project: {
    title: "The AI Assembly Line",
    description: "Project Mode transforms a high-level goal into an executable plan. The Maestro acts as a project manager, decomposing the objective into a series of tasks. Specialized agents then work on these tasks, and the Maestro synthesizes their outputs into a cohesive, final deliverable that evolves in real-time.",
    pro_cases: [
      "Generating a complete business plan from a one-sentence idea.",
      "Outlining a comprehensive research paper, with different bots handling the abstract, methodology, and conclusion.",
      "Planning a multi-channel marketing campaign.",
      "Creating a detailed software development roadmap."
    ],
    creative_cases: [
      "Writing a collaborative sci-fi novel where bots handle world-building, character arcs, and plot twists.",
      "Generating the ultimate, ridiculously detailed plan to build the perfect pillow fort.",
      "Creating a complete, playable script for a new video game level."
    ]
  },
  SocialSandbox: {
    title: "The Persona Playground",
    description: "Social Sandbox is a free-form roleplaying environment. Here, agents shed their archetypes and embody custom personas to simulate conversations, scenarios, and character dynamics. The focus is on authentic, unconstrained interaction, making it perfect for training, rehearsal, and creative exploration.",
    pro_cases: [
      "Practicing for a difficult job interview or performance review.",
      "Training for customer service calls by simulating unhappy customers.",
      "Roleplaying a high-stakes negotiation to explore different strategies.",
      "Rehearsing a sales pitch with skeptical AI 'investors.'"
    ],
    creative_cases: [
      "Simulating a TV writer's room to brainstorm a sitcom episode.",
      "Staging a debate between famous historical figures.",
      "Running a murder mystery party where the bots are the quirky suspects.",
      "Getting relationship advice by having bots roleplay you and your partner."
    ]
  },
  Comparison: {
    title: "The A/B Testing Arena",
    description: "Comparison Mode is an objective, data-driven environment for A/B testing. Two different models, agents, or strategies are pitted against each other with the exact same input. The Maestro tracks metrics like cost, speed, and quality to generate a quantitative scorecard and declare a definitive winner based on your criteria.",
    pro_cases: [
      "Determining which LLM is better for summarizing legal documents.",
      "Comparing two versions of marketing copy to see which is more persuasive.",
      "Evaluating different prompts to see which yields a more accurate response.",
      "Testing different coding approaches for efficiency and clarity."
    ],
    creative_cases: [
      "Finally settling the 'pineapple on pizza' debate by a  nd two bots give their most compelling arguments.",
      "Comparing which model tells better (or worse) dad jokes.",
      "Seeing whether a 'creative' model or a 'logical' model writes a better love poem."
    ]
  }
};