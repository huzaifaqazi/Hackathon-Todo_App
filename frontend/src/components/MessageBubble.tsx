import React from 'react';
import { formatMessageTime } from '../utils/dateUtils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  message_type?: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isOwnMessage ? 'text-blue-200' : 'text-gray-500'
          }`}
        >
          {formatMessageTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};