// Creates and exports an API client for agent-related operations.
import { Agent, Role, UploadedFile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function* streamGenerator(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<any, void, undefined> {
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    yield JSON.parse(line.substring(6));
                } catch (e) {
                    console.error('Invalid JSON:', line);
                }
            }
        }
    }
}

export const AGENT_API = {
    runAgentStream: async function*(
        maestroId: string, 
        objective: string, 
        apiKey: string,
        agents: Agent[],
        uploadedFiles: UploadedFile[]
    ): AsyncGenerator<any, void, undefined> {
        const response = await fetch(`${API_BASE_URL}/run-agent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ maestroId, objective, apiKey, agents, uploadedFiles }),
        });

        if (!response.ok || !response.body) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        yield* streamGenerator(reader);
    }
};