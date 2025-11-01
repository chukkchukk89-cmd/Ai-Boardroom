// rag/RAGService.ts

import { UploadedFile } from '../types';
import { chunkText } from './chunking';
import { createEmbedding}from './vectorUtils';
import { v4 as uuidv4 } from 'uuid';

// Define the structure of our document in IndexedDB
interface RAGDocument {
  id: string;
  embedding: number[];
  text: string;
  source: string;
}

// Cosine Similarity helper function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}


export class RAGService {
  private db: IDBDatabase | null = null;
  private dbName: string = 'RAGServiceDB';
  private storeName: string = 'documents';
  private isInitialized: boolean = false;

  constructor() {
    // The actual DB initialization is async, so we do it in init()
  }

  /**
   * Initializes the RAG service by opening the IndexedDB database.
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        console.log(`IndexedDB '${this.dbName}' opened successfully.`);
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error opening IndexedDB:", (event.target as IDBOpenDBRequest).error);
        reject(new Error("Failed to initialize IndexedDB for RAG service."));
      };
    });
  }

  /**
   * Processes a list of uploaded files, chunks their content,
   * creates embeddings, and adds them to the IndexedDB store.
   * @param files The files to process.
   */
  async addFiles(files: UploadedFile[]): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
    if (!this.db) {
        throw new Error("Database not initialized.");
    }

    console.log(`Adding ${files.length} files to RAG context...`);
    const transaction = this.db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    for (const file of files) {
      const chunks = chunkText(file.content, 1024, 128, file.fileName); // Use fileName from UploadedFile

      for (const chunk of chunks) {
        try {
            const embedding = await createEmbedding(chunk.content);
            const document: RAGDocument = {
              id: uuidv4(),
              embedding: embedding,
              text: chunk.content,
              source: chunk.metadata.source,
            };
            store.put(document);
        } catch (error) {
            console.error(`Failed to process chunk for ${file.fileName}:`, error);
            // Continue to next chunk/file
        }
      }
    }

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            console.log(`RAG processing complete. Files are stored in IndexedDB.`);
            resolve();
        };
        transaction.onerror = (event) => {
            console.error("Error adding files to IndexedDB:", transaction.error);
            reject(new Error("Failed to add files to RAG context."));
        };
    });
  }

  /**
   * Retrieves the most relevant context from the processed files for a given query.
   * @param query The user's query or the current topic of discussion.
   * @param topK The number of relevant chunks to retrieve.
   * @returns A formatted string of the retrieved context, or null if no context is found.
   */
  async retrieveContext(query: string, topK: number = 3): Promise<string | null> {
    if (!this.isInitialized || !this.db) {
      console.warn("RAG service not initialized or DB not available. Cannot retrieve context.");
      return null;
    }

    console.log(`Retrieving RAG context for query: "${query}"`);
    const queryVector = await createEmbedding(query);

    const allDocs = await this.getAllDocuments();
    if (allDocs.length === 0) {
        return null;
    }

    // Calculate similarity for each document
    const docsWithSimilarity = allDocs.map(doc => ({
        ...doc,
        similarity: cosineSimilarity(queryVector, doc.embedding)
    }));

    // Sort by similarity (descending) and take the top K
    const topDocs = docsWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

    if (topDocs.length === 0) {
      return null;
    }

    // Format the results into a single context string
    const contextString = topDocs
      .map((doc, i) => {
        return `
--- Relevant Document Snippet ${i + 1} (Source: ${doc.source}) ---
${doc.text}
      `.trim();
      })
      .join('\n\n');

    return contextString;
  }

  /**
   * Fetches all documents from the IndexedDB store.
   */
  private getAllDocuments(): Promise<RAGDocument[]> {
      return new Promise((resolve, reject) => {
          if (!this.db) return reject("DB not initialized");
          const transaction = this.db.transaction(this.storeName, 'readonly');
          const store = transaction.objectStore(this.storeName);
          const request = store.getAll();

          request.onsuccess = () => {
              resolve(request.result);
          };
          request.onerror = () => {
              console.error("Error fetching all documents:", request.error);
              reject(new Error("Could not fetch documents from IndexedDB."));
          };
      });
  }


  /**
   * Clears all processed data from the service.
   */
  async reset(): Promise<void> {
    if (!this.isInitialized || !this.db) {
        await this.init();
    }
    if (!this.db) {
        throw new Error("Database not initialized.");
    }

    const transaction = this.db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.clear();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            console.log("RAGService IndexedDB store has been cleared.");
            resolve();
        };
        request.onerror = () => {
            console.error("Error clearing IndexedDB store:", request.error);
            reject(new Error("Failed to reset RAGService."));
        };
    });
  }
}