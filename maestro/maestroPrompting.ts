
// maestro/maestroPrompting.ts
// Fix: Correct import path for types.
import { Agent, MaestroPromptContext } from '../types';
import { constructBoardroomPrompt, buildProjectTurnPrompt, constructSandboxPrompt } from '../prompts';
// Fix: Imported LLMResponse from the correct source file where it is defined.
import { LLMProvider, LLMRequest, GeminiProvider, UnsupportedProvider, LLMResponse } from './providers';
import { GoogleGenAI, Modality } from '@google/genai';

// Extend the response to include optional audio data
// Fix: Extended the correct LLMResponse type, giving AgentLLMResponse the 'text' property.
export interface AgentLLMResponse extends LLMResponse {
    audio?: string; // base64 encoded audio
}

/**
 * A factory function that returns the appropriate LLM provider instance
 * based on the agent's configuration.
 */
const getProviderForAgent = (agent: Agent): LLMProvider => {
  switch (agent.model.provider) {
    case 'Gemini':
      return new GeminiProvider();
    case 'Anthropic':
    case 'Groq':
    case 'DeepSeek':
    case 'Qwen':
      return new UnsupportedProvider(agent.model.provider);
    default:
      console.warn(`Unknown provider: ${agent.model.provider}. Defaulting to Gemini.`);
      return new GeminiProvider();
  }
};

/**
 * Selects the correct prompt building function based on the mode.
 */
const getPromptBuilder = (mode: MaestroPromptContext['mode']): ((context: MaestroPromptContext) => string) => {
    switch (mode) {
        case 'Boardroom': return constructBoardroomPrompt;
        case 'Project': return buildProjectTurnPrompt;
        case 'SocialSandbox': return constructSandboxPrompt;
        case 'Comparison': return constructBoardroomPrompt; // Fallback
        default: return constructBoardroomPrompt;
    }
}

/**
 * A dedicated function to generate speech from text using the Gemini TTS model.
 */
const generateSpeech = async (text: string, voice: string): Promise<string | undefined> => {
    if (!import.meta.env.VITE_API_KEY) {
        console.error("Cannot generate speech: Gemini API Key is not configured.");
        return undefined;
    }
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        return undefined;
    }
};


/**
 * A high-level function that orchestrates an agent's turn.
 * It selects the provider, builds the prompt, makes the API call, and returns a normalized response.
 * This is the core of the multi-LLM abstraction layer.
 * @param context The complete context for the agent's turn.
 * @param prompt The user-facing prompt or instruction for the agent.
 * @param temperature Override for the creativity/temperature setting.
 * @returns A standardized LLMResponse object.
 */
export const generateAgentResponse = async (
  context: MaestroPromptContext,
  prompt: string,
  temperature: number
): Promise<AgentLLMResponse> => {
  const provider = getProviderForAgent(context.agent);
  const promptBuilder = getPromptBuilder(context.mode);
  const systemInstruction = promptBuilder(context);

  const request: LLMRequest = {
    systemInstruction,
    prompt,
    temperature,
    modelName: context.agent.model.modelName,
    tools: context.tools,
  };
  
  const textResponse = await provider.generateContent(request, context);

  // If the agent has a voice and the text response was successful, generate audio.
  if (context.agent.voice && textResponse.text) {
      const audio = await generateSpeech(textResponse.text, context.agent.voice);
      return { ...textResponse, audio };
  }

  return textResponse;
};

// Kept for simple, non-agent-based calls where the full context isn't needed.
export const constructMaestroPrompt = (context: MaestroPromptContext): string => {
  const promptBuilder = getPromptBuilder(context.mode);
  return promptBuilder(context);
};
