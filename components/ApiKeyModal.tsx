import React from 'react';

interface ProviderInfo {
  name: string;
  url: string;
  envVar: string;
  docsNote?: string;
}

const PROVIDER_INFO: { [key: string]: ProviderInfo } = {
  Gemini: {
    name: "Gemini",
    url: "https://aistudio.google.com/app/apikey",
    envVar: 'API_KEY',
  },
  Anthropic: {
    name: "Anthropic (Claude)",
    url: "https://console.anthropic.com/dashboard",
    envVar: 'ANTHROPIC_API_KEY',
    docsNote: "Note: This app currently only has live support for Gemini. To use other models, you would need to configure the application to use their respective API keys.",
  },
  Groq: {
    name: "Groq (Llama)",
    url: "https://console.groq.com/keys",
    envVar: 'GROQ_API_KEY',
    docsNote: "Note: This app currently only has live support for Gemini. To use other models, you would need to configure the application to use their respective API keys.",
  },
  DeepSeek: {
    name: "DeepSeek",
    url: "https://platform.deepseek.com/",
    envVar: 'DEEPSEEK_API_KEY',
    docsNote: "Note: This app currently only has live support for Gemini. To use other models, you would need to configure the application to use their respective API keys.",
  },
  Qwen: {
    name: "Alibaba Cloud (Qwen)",
    url: "https://www.aliyun.com/product/bailian",
    envVar: 'DASHSCOPE_API_KEY',
    docsNote: "Note: This app currently only has live support for Gemini. To use other models, you would need to configure the application to use their respective API keys.",
  }
};


interface ApiKeyModalProps {
  provider: string | null;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ provider, onClose }) => {
  if (!provider) return null;

  const info = PROVIDER_INFO[provider];

  if (!info) {
      console.error(`API Key modal opened for unknown provider: ${provider}`);
      return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{info.name} API Key Required</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="text-gray-300 space-y-4">
          <p>To use {info.name} models, the application needs an API key.</p>
          <div className="space-y-2">
            <p className="font-semibold">Step 1: Get your key</p>
            <p>
              Visit the {info.name} developer console to create and copy your API key.
            </p>
            <a 
              href={info.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Get API Key from {info.name}
            </a>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Step 2: Configure your environment</p>
            <p>
              This application is configured to read your API key from an environment variable named <code>{info.envVar}</code>. Please set this variable in your project's environment to proceed.
            </p>
            <div className="bg-gray-900 p-3 rounded-lg">
              <code className="text-sm text-yellow-300">{info.envVar}="your_api_key_here"</code>
            </div>
          </div>
          {info.docsNote && (
            <div className="mt-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
                <p className="text-sm text-amber-300">{info.docsNote}</p>
            </div>
          )}
        </div>
        <div className="mt-6 text-right">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors text-sm font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};