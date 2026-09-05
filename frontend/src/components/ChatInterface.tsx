import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Send,
  Bot,
  ChevronDown,
  Calendar,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Task } from '../types/task';
import { chatApi } from '../services/chatApi';
import { getPriorityBadgeClass } from '../lib/task-ui';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  taskPreview?: Task;
  quickActions?: string[];
  codeBlock?: {
    language: string;
    code: string;
  };
}

interface ChatInterfaceProps {
  userId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();

  // Sample quick actions
  const sampleQuestions = [
    "Show my tasks",
    "Add new task",
    "What's pending?",
    "Mark task complete"
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
    }
  }, [inputValue]);

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Create conversation if it doesn't exist
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const response = await chatApi.createConversation({ initial_message: messageText });
        currentConversationId = response.conversation.id;
        setConversationId(currentConversationId);
      }

      // Send message to API
      const response = await chatApi.sendMessage(currentConversationId, messageText);

      // Convert API response to UI Message format
      const assistantMessage: Message = {
        id: response.response.id,
        type: 'assistant',
        content: response.response.content,
        timestamp: new Date(response.response.timestamp),
        quickActions: ['Show my tasks', 'Add new task', 'View calendar']
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle quick action click
  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-card border border-ink-border/70 shadow-card overflow-hidden">
      {/* Header — gradient band with AI identity */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-600 to-violet-600 px-6 py-5 overflow-hidden">
        <div
          className="absolute -top-16 -right-10 w-56 h-56 bg-violet-400/25 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* AI Avatar — animated pulse ring */}
            <div className="relative">
              <span
                className="absolute -inset-1.5 rounded-full bg-white/30 animate-ping"
                style={{ animationDuration: '2.5s' }}
                aria-hidden="true"
              />
              <div className="relative w-12 h-12 bg-white/15 border border-white/25 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Todo Assistant
              </h2>
              <p className="text-primary-100 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                Always active — replies instantly
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            <span className="text-xs font-semibold text-white/90">AI-powered</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-surface-background to-white p-4 sm:p-6 space-y-5"
      >
        {messages.length === 0 ? (
          /* Empty State — welcome hero */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center mb-5 shadow-glow-primary"
            >
              <Bot className="w-10 h-10 text-primary-600" aria-hidden="true" />
            </motion.div>
            <h3 className="font-display text-2xl font-bold text-ink tracking-tight mb-2">
              Start a conversation
            </h3>
            <p className="text-ink-muted mb-8 max-w-sm leading-relaxed">
              Ask me anything about your tasks — I can add, complete, and plan them for you.
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center max-w-md">
              {sampleQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                  onClick={() => handleQuickAction(question)}
                  className="px-4 py-2.5 bg-white border border-primary-100 text-primary-700 rounded-full text-sm font-semibold tracking-tight hover:bg-primary-50 hover:border-primary-300 hover:shadow-subtle transition-all cursor-pointer"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar — only for AI messages */}
                  {message.type === 'assistant' && (
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-subtle mt-1">
                      <Bot className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Sender label + timestamp */}
                    <div
                      className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider px-1 ${
                        message.type === 'user' ? 'flex-row-reverse text-primary-600' : 'text-violet-600'
                      }`}
                    >
                      {message.type === 'user' ? 'You' : 'Assistant'}
                      <span className="text-ink-subtle/70 font-medium normal-case tracking-normal tabular-nums">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    {/* Message Bubble — distinct per sender */}
                    {message.type === 'user' ? (
                      /* USER: gradient bubble, clean sans, rounded with tail-side corner */
                      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl rounded-tr-md px-5 py-3.5 shadow-glow-primary">
                        <p className="text-[15px] font-semibold tracking-tight leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    ) : (
                      /* AI: white card with border, Sora display font + medium weight
                         for a distinct assistant voice, sharp top-left corner */
                      <div className="bg-white border border-ink-border/80 rounded-2xl rounded-tl-md px-5 py-3.5 shadow-subtle">
                        <p className="font-display text-[15px] font-medium text-ink leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    )}

                    {/* Code Block — only AI */}
                    {message.type === 'assistant' && message.codeBlock && (
                      <div className="mt-2 bg-ink rounded-card overflow-hidden border border-ink/80">
                        <div className="flex items-center justify-between px-4 py-2 bg-ink/90 border-b border-white/10">
                          <span className="text-xs font-semibold text-ink-border uppercase tracking-wider">
                            {message.codeBlock.language}
                          </span>
                          <button
                            onClick={() => handleCopyCode(message.codeBlock!.code, message.id)}
                            aria-label="Copy code"
                            className="text-ink-border hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedCode === message.id ? (
                              <Check className="w-4 h-4 text-success-500" aria-hidden="true" />
                            ) : (
                              <Copy className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-sm text-white/90 overflow-x-auto font-mono">
                          <code>{message.codeBlock.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Quick Actions — only AI */}
                    {message.type === 'assistant' && message.quickActions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.quickActions.map((action, index) => (
                          <motion.button
                            key={index}
                            whileHover={reduceMotion ? undefined : { y: -1 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                            onClick={() => handleQuickAction(action)}
                            className="px-3 py-1.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-xs font-semibold tracking-tight hover:bg-primary-100 hover:border-primary-300 transition-colors cursor-pointer"
                          >
                            {action}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Task Preview Card — only AI */}
                    {message.type === 'assistant' && message.taskPreview && (
                      <div className="mt-2 bg-white rounded-card border border-ink-border/80 p-3.5 shadow-subtle">
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                              message.taskPreview.status === 'completed' ? 'bg-success-500' : 'bg-primary-500'
                            }`}
                            aria-hidden="true"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display text-sm font-bold text-ink tracking-tight">
                              {message.taskPreview.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${getPriorityBadgeClass(message.taskPreview.priority)}`}>
                                {message.taskPreview.priority}
                              </span>
                              {message.taskPreview.due_date && (
                                <span className="text-xs text-ink-subtle font-medium flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                  {new Date(message.taskPreview.due_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                            <button className="text-xs font-bold text-primary-600 hover:text-primary-700 mt-2.5 cursor-pointer inline-flex items-center gap-1 group">
                              View details
                              <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator — AI thinking */}
            {isTyping && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-subtle mt-1">
                    <Bot className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="bg-white border border-ink-border/80 rounded-2xl rounded-tl-md px-5 py-3.5 shadow-subtle">
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map((delay) => (
                        <div
                          key={delay}
                          className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            aria-label="Scroll to latest message"
            className="absolute bottom-24 right-8 p-3 bg-primary-600 text-white rounded-full shadow-lifted hover:bg-primary-700 hover:scale-105 transition-all z-10"
          >
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area — rounded with gradient send button */}
      <div className="border-t border-ink-border/70 bg-white p-4">
        <div className="flex items-end gap-2.5">
          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your tasks..."
              rows={1}
              aria-label="Chat message"
              className="w-full px-4 py-3 border border-ink-border rounded-full bg-surface-background focus:outline-none focus:ring-2 focus:border-primary-600 focus:ring-primary-600/20 focus:bg-white resize-none overflow-hidden placeholder:text-ink-subtle/70 font-medium leading-relaxed transition-all"
              style={{ minHeight: '48px', maxHeight: '96px' }}
            />
          </div>

          {/* Send Button — gradient pill */}
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            aria-label="Send message"
            whileTap={reduceMotion ? undefined : { scale: 0.88 }}
            whileHover={inputValue.trim() && !reduceMotion ? { scale: 1.05, rotate: -6 } : undefined}
            className={`p-3.5 rounded-full transition-all flex-shrink-0 cursor-pointer ${
              inputValue.trim()
                ? 'bg-gradient-to-br from-primary-600 to-violet-600 text-white shadow-glow-primary hover:shadow-card'
                : 'bg-surface-muted text-ink-subtle cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        </div>
        <p className="text-center text-[11px] text-ink-subtle/70 mt-2.5">
          Todo Assistant can make mistakes — verify important tasks
        </p>
      </div>
    </div>
  );
};
