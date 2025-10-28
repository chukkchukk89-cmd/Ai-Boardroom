// maestro/providers/unsupportedProvider.ts

import { LLMProvider, LLMRequest, LLMResponse } from './baseProvider';

export class UnsupportedProvider implements LLMProvider {
  private providerName: string;

  constructor(providerName: string) {
    this.providerName = providerName;
  }

  async generateContent(_request: LLMRequest): Promise<LLMResponse> {
    const errorMessage = `The selected LLM provider ('${this.providerName}') is not yet implemented in this application. Please select a Gemini model to proceed.`;
    
    // This will be displayed in the session log as an error.
    return Promise.resolve({
      text: errorMessage,
      functionCalls: undefined,
    });
  }
}
