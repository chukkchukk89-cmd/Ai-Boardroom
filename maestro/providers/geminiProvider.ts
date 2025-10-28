// maestro/providers/geminiProvider.ts

import { GoogleGenAI, FunctionDeclaration } from '@google/genai';
import { LLMProvider, LLMRequest, LLMResponse } from './baseProvider';

export class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI;

  constructor() {
    // This assumes the API key is available in the environment.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  }

  async generateContent(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await this.ai.models.generateContent({
        model: request.modelName,
        contents: request.prompt,
        config: {
          systemInstruction: request.systemInstruction,
          temperature: request.temperature,
          tools: request.tools ? [{ functionDeclarations: request.tools }] : undefined,
        },
      });

      // Normalize the response to the standard format
      return {
        text: response.text,
        functionCalls: response.functionCalls,
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      // Re-throw a standardized error if needed, or handle it here
      throw new Error(`Gemini API request failed for model ${request.modelName}.`);
    }
  }
}
