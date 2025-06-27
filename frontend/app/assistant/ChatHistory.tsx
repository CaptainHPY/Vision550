import React from "react";

interface ChatHistoryProps {
  messages: Array<{
    sender: 'user' | 'assistant';
    content: string;
  }>;
  isLoading: boolean;
  onDeleteMessage?: (index: number) => void;
}

export default function ChatHistory({ messages, isLoading, onDeleteMessage }: ChatHistoryProps) {
  return (
    <div className="hero bg-base-200 max-w-2xl rounded-lg shadow-lg font-[family-name:var(--font-geist-sans)] overflow-auto max-h-[200px] custom-scrollbar">
      <div className="hero-content w-full py-8 px-4">
        <div className="w-full">
          {messages.map((message, index) => (
            <div key={index} className={`chat ${message.sender === 'user' ? 'chat-end justify-end' : 'chat-start justify-start'}`}>
              <div className="chat-header">
                {message.sender === 'user' ? '您' : 'Vision550'}
              </div>
              <div className="chat-bubble text-sm">
                {message.content}
              </div>
              {message.sender === 'user' && (
                <div className="chat-footer opacity-70 hover:opacity-90">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="cursor-pointer"
                    onClick={() => onDeleteMessage?.(index)}
                  >
                    <rect x="5" y="7" width="14" height="12" rx="2" />
                    <path d="M3 7h18M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="chat chat-start justify-start">
              <div className="chat-header">Vision550</div>
              <div className="chat-bubble text-sm">
                <span className="loading loading-infinity loading-md"></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
