// Defines default configurations for the application.

import { AgentConfig, ModelConfig } from './types';

export const DEFAULT_MODELS: ModelConfig[] = [
    { provider: 'OpenAI', modelName: 'gpt-4-turbo-preview' },
    { provider: 'OpenAI', modelName: 'gpt-3.5-turbo' },
    { provider: 'Google', modelName: 'gemini-pro' },
];

export const DEFAULT_AGENTS: AgentConfig[] = [
    {
        id: 'maestro',
        role: 'Maestro',
        expertise: 'Orchestrates the team to achieve the user\'s goal.',
        avatar: '👑',
        model: DEFAULT_MODELS[0],
        hasPersonalMemory: true,
    },
    {
        id: 'researcher',
        role: 'Researcher',
        expertise: 'Gathers and analyzes information from various sources.',
        avatar: '🧐',
        model: DEFAULT_MODELS[1],
        hasPersonalMemory: false,
    },
    {
        id: 'developer',
        role: 'Developer',
        expertise: 'Writes and debugs code, builds software solutions.',
        avatar: '💻',
        model: DEFAULT_MODELS[2],
        hasPersonalMemory: false,
    },
];
