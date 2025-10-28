// Displays the chat interface for the agent conversation.
import React from 'react';
import { Agent, ConversationMessage } from '../types';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { AgentAvatar } from './AgentAvatar';
import { MessageContent } from './MessageContent';

interface ChatViewProps {
    messages: ConversationMessage[];
    agents: Agent[];
    activeAgentId: string | null;
    prevActiveAgentId: string | null;
    isSessionActive: boolean;
    onToggleAudio: (text: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, agents, activeAgentId, isSessionActive, onToggleAudio }) => {
    const scrollRef = useAutoScroll(messages);

    const getAgentByRole = (role: string) => agents.find(a => a.role === role);

    return (
        <div ref={scrollRef} className="flex-grow bg-gray-800 p-4 rounded-lg overflow-y-auto">
            {messages.map((msg) => {
                const agent = getAgentByRole(msg.role);
                return (
                    <div key={msg.id} className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {agent && <AgentAvatar agent={agent} isActive={activeAgentId === agent.id} />}
                        <MessageContent message={msg} onToggleAudio={onToggleAudio} />
                    </div>
                );
            })}
            {isSessionActive && !activeAgentId && (
                <div className="text-center text-gray-400 mt-4">Maestro is thinking...</div>
            )}
        </div>
    );
};
