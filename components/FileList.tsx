import React from 'react';
import { UploadedFile } from '../types';
import { FileIcon, TrashIcon } from './Icons';

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  disabled: boolean;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemoveFile, disabled }) => {
  if (files.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-4">
        No files uploaded for this session.
      </div>
    );
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {files.map(file => (
        <div key={file.id} className="flex items-center bg-gray-900/50 p-2 rounded-lg">
          <FileIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
          <div className="flex-grow overflow-hidden">
            <p className="text-sm text-white truncate" title={file.name}>{file.name}</p>
            <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
          </div>
          <button
            onClick={() => onRemoveFile(file.id)}
            disabled={disabled}
            className="ml-2 p-1 text-gray-500 hover:text-red-400 disabled:text-gray-600 disabled:cursor-not-allowed"
            aria-label={`Remove ${file.name}`}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
