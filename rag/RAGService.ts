// Fix: Replaced the placeholder implementation with a production-ready Typesense integration.
import { UploadedFile } from '../types';
import { chunkText } from './chunking';
import { createEmbedding } from './vectorUtils';
import { v4 as uuidv4 } from 'uuid';
import Typesense from 'typesense';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

/**
 * A service to manage the Retrieval-Augmented Generation (RAG) process.
 * This service is responsible for processing uploaded files, creating vector embeddings,
 * storing them in Typesense, and retrieving relevant context for a given query.
 */
export class RAGService {
  private client: Typesense.Client;
  private collectionName: string;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize Typesense client
    this.client = new Typesense.Client({
      nodes: [
        {
          host: 'localhost', // Replace with your Typesense host
          port: 8108,
          protocol: 'http',
        },
      ],
      apiKey: 'xyz', // Replace with your Typesense API key
    });
    this.collectionName = `rag_${uuidv4()}`.replace(/-/g, '_');
  }

  /**
   * Initializes the RAG service by creating the necessary Typesense collection.
   */
  async init(): Promise<void> {
    try {
      // Delete the collection if it already exists
      await this.client.collections(this.collectionName).delete();
    } catch (error) {
      // Collection does not exist, which is fine
    }

    const schema: CollectionCreateSchema = {
      name: this.collectionName,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'embedding', type: 'float[]', num_dim: 768 }, // Assuming embedding dimension of 768
        { name: 'text', type: 'string' },
        { name: 'source', type: 'string' },
      ],
    };

    await this.client.collections().create(schema);
    this.isInitialized = true;
    console.log(`Typesense collection '${this.collectionName}' created.`);
  }

  /**
   * Processes a list of uploaded files, chunks their content,
   * creates embeddings, and adds them to the Typesense collection.
   * @param files The files to process.
   */
  async addFiles(files: UploadedFile[]): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    console.log(`Adding ${files.length} files to RAG context...`);
    for (const file of files) {
      // 1. Chunk the file content
      const chunks = chunkText(file.content, 1024, 128, file.name);

      // 2. Create embeddings for each chunk and index in Typesense
      for (const chunk of chunks) {
        const embedding = await createEmbedding(chunk.content);
        await this.client.collections(this.collectionName).documents().create({
          id: uuidv4(),
          embedding: embedding,
          text: chunk.content,
          source: chunk.metadata.source,
        });
      }
    }
    console.log(`RAG processing complete.`);
  }

  /**
   * Retrieves the most relevant context from the processed files for a given query.
   * @param query The user's query or the current topic of discussion.
   * @param topK The number of relevant chunks to retrieve.
   * @returns A formatted string of the retrieved context, or null if no context is found.
   */
  async retrieveContext(query: string, topK: number = 3): Promise<string | null> {
    if (!this.isInitialized) {
      return null;
    }

    console.log(`Retrieving RAG context for query: "${query}"`);
    // 1. Create an embedding for the query
    const queryVector = await createEmbedding(query);

    // 2. Query the Typesense collection
    const searchResults = await this.client.collections(this.collectionName).documents().search({
      q: '*',
      vector_query: {
        field: 'embedding',
        vector: queryVector,
        k: topK,
      },
    });

    if (!searchResults.hits || searchResults.hits.length === 0) {
      return null;
    }

    // 3. Format the results into a single context string
    const contextString = searchResults.hits
      .map((hit, i) => {
        const doc = hit.document as any;
        return `
--- Relevant Document Snippet ${i + 1} (Source: ${doc.source}) ---
${doc.text}
      `.trim();
      })
      .join('\n\n');

    return contextString;
  }

  /**
   * Clears all processed data from the service.
   */
  async reset(): Promise<void> {
    try {
      await this.client.collections(this.collectionName).delete();
    } catch (error) {
      // Ignore errors if collection doesn't exist
    }
    this.isInitialized = false;
    console.log("RAGService has been reset.");
  }
}
