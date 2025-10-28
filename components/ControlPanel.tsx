import React from 'react';
import { UploadedFile } from '../types';
import { FileUploader } from './FileUploader';
import { FileList } from './FileList';

interface ControlPanelProps {
    userObjective: string;
    setUserObjective: (objective: string) => void;
    isSessionActive: boolean;
    onStart: () => void;
    onStop: () => void;
    uploadedFiles: UploadedFile[];
    onFileUpload: (files: UploadedFile[]) => void;
    onRemoveFile: (fileName: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ userObjective, setUserObjective, isSessionActive, onStart, onStop, uploadedFiles, onFileUpload, onRemoveFile }) => {
    return (
        <div className="flex-shrink-0 bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-4">
                <div className="flex-grow">
                    <input 
                        type="text"
                        value={userObjective}
                        onChange={e => setUserObjective(e.target.value)}
                        className="w-full bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your objective..."
                        disabled={isSessionActive}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FileUploader onFileUpload={onFileUpload} disabled={isSessionActive} />
                    {
                        !isSessionActive ?
                        <button onClick={onStart} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">Start</button> : 
                        <button onClick={onStop} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md">Stop</button>
                    }
                </div>
            </div>
            <div className="mt-4">
                <FileList files={uploadedFiles} onRemoveFile={onRemoveFile} disabled={isSessionActive} />
            </div>
        </div>
    );
};