import React from "react";

interface ChatHistoryProps {
  messages: Array<{
    sender: 'user' | 'assistant';
    content: string;
  }>;
  isLoading: boolean;
}

export default function ChatHistory({ messages, isLoading }: ChatHistoryProps) {
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
