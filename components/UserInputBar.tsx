// Fix: Creates the UserInputBar component for user interaction.
import React, { useState, useEffect, useRef } from 'react';

// A simple microphone icon
const MicIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
    </svg>
);


interface UserInputBarProps {
  onSendMessage: (message: string) => void;
  isSessionActive: boolean;
  placeholderText?: string;
}

// Check for SpeechRecognition API
// Fix: Cast window to `any` to allow access to vendor-prefixed speech recognition APIs without TS errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export const UserInputBar: React.FC<UserInputBarProps> = ({ onSendMessage, isSessionActive, placeholderText }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.log("Speech recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setMessage(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
        setIsListening(false);
    }

    recognitionRef.current = recognition;

  }, []);

  const handleToggleListening = () => {
      if (!isSpeechRecognitionSupported) return;
      
      if (isListening) {
          recognitionRef.current?.stop();
      } else {
          recognitionRef.current?.start();
      }
      setIsListening(!isListening);
  }

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white flex-shrink-0">
        U
      </div>
      <div className="flex-grow">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          rows={2}
          placeholder={isListening ? "Listening..." : (placeholderText || "Enter your message or instructions here...")}
          className="w-full bg-transparent text-gray-200 resize-none focus:outline-none placeholder-gray-500"
          disabled={!isSessionActive}
        />
      </div>
       {isSpeechRecognitionSupported && (
        <button
            onClick={handleToggleListening}
            disabled={!isSessionActive}
            className={`self-end p-2 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed ${
                isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
            <MicIcon className="w-5 h-5 text-white" />
        </button>
       )}
      <button
        onClick={handleSend}
        disabled={!isSessionActive || !message.trim()}
        className="self-end bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
};
