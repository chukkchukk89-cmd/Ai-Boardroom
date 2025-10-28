// utils/files.ts
// Fix: Added import for UploadedFile type.
import { UploadedFile } from '../types';


/**
 * Converts a Blob to a base64 encoded string.
 * @param blob The blob to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix, like "data:image/jpeg;base64,"
        // We need to strip that part out.
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("FileReader result is not a string."));
      }
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Reads the content of a file as text.
 * @param file The file to read.
 * @returns A promise that resolves with the file's text content.
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};
// Fix: Added the missing formatFilesAsContext function to resolve the import error.
/**
 * Formats uploaded file content into a single string for context.
 * @param files The uploaded files.
 * @returns A formatted string containing the content of the files.
 */
export const formatFilesAsContext = (files: UploadedFile[]): string => {
  if (files.length === 0) return '';

  return files.map(file => `
--- START OF FILE: ${file.name} ---
${file.content}
--- END OF FILE: ${file.name} ---
  `.trim()).join('\n\n');
};
