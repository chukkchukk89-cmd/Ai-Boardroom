// Displays the content of a message.
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ConversationMessage } from '../types';

interface MessageContentProps {
    message: ConversationMessage;
    onToggleAudio: (text: string) => void;
}

export const MessageContent: React.FC<MessageContentProps> = ({ message, onToggleAudio }) => {
    return (
        <div className="bg-gray-700 p-3 rounded-lg max-w-xl">
            <ReactMarkdown className="prose prose-invert">{message.content}</ReactMarkdown>
            <button onClick={() => onToggleAudio(message.content)} className="text-blue-400 text-xs mt-2">Play Audio</button>
        </div>
    );
};