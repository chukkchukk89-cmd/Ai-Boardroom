// maestro/providers/baseProvider.ts

import { FunctionDeclaration } from '@google/genai';
import { MaestroPromptContext } from '../../types';

/**
 * A standardized request object that can be translated to any provider's format.
 */
export interface LLMRequest {
  systemInstruction: string;
  // Simplified contents for abstraction
  prompt: string;
  temperature: number;
  modelName: string;
  tools?: FunctionDeclaration[];
}

/**
 * A standardized response object that normalizes outputs from different providers.
 */
export interface LLMResponse {
  text: string;
  functionCalls?: any; // Kept generic to handle different SDKs
}

/**
 * The interface that all LLM provider wrappers must implement.
 */
export interface LLMProvider {
  generateContent(request: LLMRequest, context?: MaestroPromptContext): Promise<LLMResponse>;
}
