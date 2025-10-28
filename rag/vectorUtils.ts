import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey } from '../apiKeys';

// Represents a vector with its metadata.
export interface Vector {
  id: string;
  values: number[];
  metadata: {
    [key: string]: any;
  };
}

/**
 * Creates a vector embedding for a given text using the Google Generative AI SDK.
 * @param text The text to embed.
 * @returns A promise that resolves to a vector embedding.
 */
export const createEmbedding = async (text: string): Promise<number[]> => {
  const apiKey = getApiKey('Gemini');
  if (!apiKey) {
    throw new Error('Gemini API key not found.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });

  const result = await model.embedContent(text);
  const embedding = result.embedding.values;
  return embedding;
};
