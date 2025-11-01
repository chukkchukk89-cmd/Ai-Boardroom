import React, { useCallback, useState } from 'react';
import { PlusIcon } from './Icons';
import { readFileAsText } from '../utils/files';
import { UploadedFile } from '../types';

interface FileUploaderProps {
  onFileUpload: (files: UploadedFile[]) => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const uploadedFiles: UploadedFile[] = [];
    for (const file of Array.from(files)) {
      try {
        const content = await readFileAsText(file);
        uploadedFiles.push({
          id: `${file.name}-${Date.now()}`,
          fileName: file.name,
          size: file.size,
          content: content,
        });
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
        // Optionally show an error to the user
      }
    }
    if (uploadedFiles.length > 0) {
      onFileUpload(uploadedFiles);
    }
  }, [onFileUpload]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
        ${disabled ? 'border-gray-700 bg-gray-900/50 cursor-not-allowed' : 'border-gray-600 hover:border-purple-500'}
        ${isDragging ? 'bg-purple-900/50 border-purple-500' : ''}`}
    >
      <input
        type="file"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleInputChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center text-gray-400">
        <PlusIcon className="w-8 h-8 mb-2" />
        <p className="text-sm">Drag & drop files here</p>
        <p className="text-xs">or click to browse</p>
      </div>
    </div>
  );
};