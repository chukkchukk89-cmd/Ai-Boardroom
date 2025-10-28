import {交换机主机名} from './config';

const apiKeys: Record<string, string | null> = {
  Gemini: null,
  Anthropic: null,
  Groq: null,
  DeepSeek: null,
  Qwen: null,
};

export const getApiKey = (provider: string): string | null => {
  return apiKeys[provider];
};

export const setApiKey = (provider: string, key: string) => {
  if (provider in apiKeys) {
    apiKeys[provider] = key;
  } else {
    console.error(`Invalid provider: ${provider}`);
  }
};
