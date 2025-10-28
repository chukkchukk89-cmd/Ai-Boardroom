
import { FunctionDeclaration } from '@google/genai';

// Base types for agent configuration
export interface ModelConfig {
  provider: string;
  modelName: string;
}

export type AgentStatus = 'idle' | 'working' | 'done' | 'error';

export interface AgentConfig {
  id: string;
  role: string;
  expertise: string;
  avatar: string;
  model: ModelConfig;
  hasPersonalMemory: boolean;
  voice?: string;
}

export interface Agent extends AgentConfig {
  status: AgentStatus;
  currentTask: string | null;
}

// Types for session management and logging
export type AppMode = 'Boardroom' | 'Project' | 'SocialSandbox' | 'Comparison';

export interface SessionLogEntry {
  id: string;
  timestamp: number;
  role: string; // Could be an agent's role or 'User'
  avatar: string;
  content: string;
  audio?: string; // base64 encoded audio data
}

export interface ArchivedSession {
  id: string;
  timestamp: number;
  goal: string;
  finalPlan: string | null;
  log: SessionLogEntry[];
}

// Types for Boardroom mode
export interface ItineraryItem {
  id: string;
  text: string;
  completed: boolean;
}

// Types for Project mode
export type TaskStatus = 'pending' | 'todo' | 'inprogress' | 'done' | 'blocked';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string | null;
}

export interface Milestone {
  milestoneId: string;
  name: string;
  objective: string;
  deliverables: string[];
  estimatedDuration: string;
  assignedAgents: string[];
  dependencies: string[];
  currentStatus: TaskStatus;
}

export interface ProjectAgent {
  agentId: string;
  specializations: string[];
  currentTasks: string[];
  availability: boolean;
}

export interface ProjectData {
  projectId: string;
  projectName: string;
  superPrompt: string;
  goal: string;
  constraints: string[];
  milestones: Milestone[];
  agents: ProjectAgent[];
}


// Types for general controls and settings
export type ConversationTemperature = 'Orderly' | 'Debate' | 'Heated';
export type OutputFormat = 'Markdown' | 'JSON' | 'Email';

// Types for UI interaction
export type TimelineEventType = 'decision' | 'agent_contribution' | 'user_input' | 'alteration' | 'task_complete' | 'doc_generation';

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: TimelineEventType;
  title: string;
  description?: string;
  refId: string; // ID of the corresponding log entry or document
}

// Type for file uploads
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
}

// Type for the Maestro's prompt context object
export interface MaestroPromptContext {
  mode: AppMode;
  agent: Agent;
  agents: Agent[];
  userName: string;
  sessionGoal: string;
  maestroMemory?: string;
  agentMemory?: string;
  docContext?: string;
  lastTurns: SessionLogEntry[];
  tools?: FunctionDeclaration[];
  // Mode-specific context
  currentItineraryItem?: ItineraryItem;
  currentMilestone?: Milestone;
  sandboxScenario?: string;
  dynamicWeights?: { milestone: number; criticalThinking: number; innovation: number };
}
