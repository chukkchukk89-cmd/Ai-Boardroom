// Fix: Added a placeholder implementation for the text chunking utility.
/**
 * Simple text chunking utility for RAG.
 * This is a basic implementation and could be replaced with more sophisticated methods.
 */

interface Chunk {
  content: string;
  metadata: {
    source: string;
    page?: number; // Optional
  };
}

/**
 * Chunks text into smaller pieces based on a specified size and overlap.
 * @param text The text content to chunk.
 * @param chunkSize The maximum size of each chunk.
 * @param chunkOverlap The number of characters to overlap between chunks.
 * @param sourceIdentifier An identifier for the source of the text (e.g., filename).
 * @returns An array of Chunks.
 */
export const chunkText = (
  text: string,
  chunkSize: number = 1024,
  chunkOverlap: number = 128,
  sourceIdentifier: string
): Chunk[] => {
  if (chunkSize <= chunkOverlap) {
    throw new Error("chunkSize must be greater than chunkOverlap");
  }

  const chunks: Chunk[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push({
      content: text.substring(i, end),
      metadata: { source: sourceIdentifier },
    });
    i += chunkSize - chunkOverlap;
  }
  return chunks;
};
