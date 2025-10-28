// Defines and exports all necessary TypeScript types for the application.

export type Role = 'user' | 'assistant' | 'Maestro' | 'Researcher' | 'Developer' | string;

export interface Agent {
    id: string;
    role: Role;
    status: 'idle' | 'working' | 'done' | 'error';
    expertise: string;
    avatar: string;
    model: ModelConfig;
    hasPersonalMemory: boolean;
    currentTask: string | null;
}

export interface AgentConfig {
    id: string;
    role: Role;
    expertise: string;
    avatar: string;
    model: ModelConfig;
    hasPersonalMemory: boolean;
}

export interface ModelConfig {
    provider: 'OpenAI' | 'Anthropic' | 'Google' | string;
    modelName: string;
}

export interface ConversationMessage {
    id: string;
    role: Role;
    content: string;
}

export interface UploadedFile {
    id: string;
    fileName: string;
    size: number;
    content: string;
}
