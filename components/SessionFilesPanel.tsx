import React from 'react';
import { FileUploader } from './FileUploader';
import { FileList } from './FileList';
import { UploadedFile } from '../types';

interface SessionFilesPanelProps {
  files: UploadedFile[];
  onFileUpload: (files: UploadedFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  isSessionActive: boolean;
}

export const SessionFilesPanel: React.FC<SessionFilesPanelProps> = ({ files, onFileUpload, onRemoveFile, isSessionActive }) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl h-full">
      <h3 className="text-base font-bold text-white text-center flex-shrink-0">Session Files</h3>
      <div className="flex-shrink-0">
        <FileUploader onFileUpload={onFileUpload} disabled={isSessionActive} />
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        <FileList files={files} onRemoveFile={onRemoveFile} disabled={isSessionActive} />
      </div>
    </div>
  );
};
