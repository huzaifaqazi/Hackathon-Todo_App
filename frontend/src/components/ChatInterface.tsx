import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { chatApi } from '../services/chatApi';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime, formatDate } from '../utils/dateUtils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  message_type?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  userId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId }) => {
  const { isAuthenticated, user } = useAuth(); // Get authentication status
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
    }
  }, [isAuthenticated, user]);

  // Process conversations to deduplicate and sort by updated_at
  useEffect(() => {
    if (conversations.length > 0) {
      // Remove duplicates and sort by updated_at (most recent first)
      const uniqueConversations = Array.from(
        new Map(conversations.map(conv => [conv.id, conv])).values()
      ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      // Only keep the most recent 20 conversations
      const limitedConversations = uniqueConversations.slice(0, 20);

      // Update state only if there are changes
      if (limitedConversations.length !== conversations.length) {
        setConversations(limitedConversations);
      }
    }
  }, [conversations]);

  // Select the first conversation if none is selected and conversations are loaded
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      const conv = conversations[0];
      if (conv && conv.id) {
        setSelectedConversation(conv.id);
        loadConversationMessages(conv.id);
      }
    }
    // Removed automatic conversation creation when no conversations exist
    // Now conversation will only be created when user sends first message
  }, [conversations, selectedConversation, isAuthenticated, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const loadConversations = async () => {
    // Check authentication before attempting to load conversations
    if (!isAuthenticated || !user) {
      console.error('User not authenticated when trying to load conversations');
      return;
    }

    try {
      const response = await chatApi.getUserConversations();
      setConversations(response.conversations || []);

      // Select the first conversation if none is selected
      if (!selectedConversation && response.conversations && response.conversations.length > 0) {
        const conv = response.conversations[0];
        if (conv?.id) {
          setSelectedConversation(conv.id);
          await loadConversationMessages(conv.id);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Even if loading conversations fails, we should still try to create a new one if no conversation exists
      // Since userId is not in scope here, we'll rely on the second useEffect to handle the fallback
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    // Check authentication before attempting to load messages
    if (!isAuthenticated || !user) {
      console.error('User not authenticated when trying to load messages');
      return;
    }

    try {
      setIsLoading(true);
      const response = await chatApi.getConversationMessages(conversationId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (initialMessage?: string) => {
    // Check authentication before attempting to create conversation
    if (!isAuthenticated || !user) {
      console.error('User not authenticated when trying to create conversation');
      throw new Error('Authentication required. Please log in to continue.');
    }

    try {
      setIsLoading(true);

      // Validate initialMessage and clean it up for better titles
      const messageToUse = initialMessage || `Chat - ${formatDate(new Date().toISOString())}`;

      // Clean up the message to create a better title
      let title = initialMessage ? initialMessage.trim().substring(0, 50) : messageToUse.substring(0, 50);

      // Remove common prefixes like "add task", "show me", etc. to create better titles
      if (initialMessage) {
        title = initialMessage.trim().substring(0, 50);

        // Remove common prefixes to make titles more meaningful
        const prefixesToRemove = [
          /^add task /i,
          /^create task /i,
          /^show me /i,
          /^tell me /i,
          /^help me /i,
          /^can you /i,
          /^please /i,
          /^i want to /i,
          /^i need to /i
        ];

        for (const prefix of prefixesToRemove) {
          title = title.replace(prefix, '');
        }

        // Capitalize first letter and truncate if needed
        if (title.length > 0) {
          title = title.charAt(0).toUpperCase() + title.slice(1);
        }

        if (initialMessage.length > 50) {
          title = title.substring(0, 47) + "...";
        }
      }

      const response = await chatApi.createConversation({ initial_message: messageToUse });

      // Check if response has the expected structure
      if (!response || !response.conversation) {
        console.error('Invalid response structure from createConversation API:', response);
        throw new Error('Invalid response from server: missing conversation data');
      }

      const newConversation = response.conversation;

      // Validate that the response contains a valid conversation with ID
      if (!newConversation || !newConversation.id) {
        console.error('Conversation object missing or invalid ID:', newConversation);
        throw new Error('Invalid conversation response: missing ID');
      }

      // Add to conversations list and select it
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation.id);
      setMessages([]);
      return newConversation; // Return the created conversation
    } catch (error) {
      console.error('Error creating conversation:', error);

      // Check if it's an authentication error
      if (error instanceof Error &&
          (error.message.includes('401') || error.message.includes('403') || error.message.includes('Not authenticated'))) {
        throw new Error('Authentication required. Please log in to continue.');
      }

      // Re-throw the error so calling functions can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    // Prevent the click from propagating to the parent element
    event.stopPropagation();

    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await chatApi.deleteConversation(conversationId);

      // Remove conversation from the list
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      // If the deleted conversation was the current one, reset to empty state
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      // Show success message
      alert('Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const goToHome = () => {
    setSelectedConversation(null);
    setMessages([]);
    // Navigate to the dashboard page (main home page for authenticated users)
    router.push('/dashboard');
  };

  const handleSendMessage = async () => {
    // Check authentication before attempting to send message
    if (!isAuthenticated || !user) {
      console.error('User not authenticated when trying to send message');
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Authentication required. Please log in to continue.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (!inputValue.trim()) return;

    let conversationId = selectedConversation;

    // If no conversation is selected, create a new one first using the input as the initial message
    if (!conversationId) {
      try {
        const newConversation = await createNewConversation(inputValue.substring(0, 50)); // Use first 50 chars as title

        if (newConversation && newConversation.id) {
          conversationId = newConversation.id;
          setSelectedConversation(conversationId);
          // Update conversations list to include the new conversation
          setConversations(prev => [newConversation, ...prev]);
        } else {
          console.error("Failed to create conversation: no valid ID returned");
          return;
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
        // Show error message to user
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Sorry, I encountered an error creating a new conversation. Please try again.',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    // Add user message optimistically
    setMessages(prev => [...prev, userMessage]);
    const tempInputValue = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(conversationId, tempInputValue);
      const aiMessage = response.response;

      // Add AI response
      setMessages(prev => [...prev, aiMessage]);

      // If this is the first message in the conversation, update the conversation title
      if (messages.length === 0) {
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, title: tempInputValue.substring(0, 50) }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Show error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isAuthenticated || !user ? (
        <div className="flex h-full bg-gray-50 items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access the AI chatbot.</p>
            <div className="flex gap-3 justify-center">
              <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200">
                Log In
              </a>
              <a href="/register" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition duration-200">
                Sign Up
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full bg-gray-50">
          {/* Sidebar for conversations */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col gap-2">
                <button
                  onClick={goToHome}
                  disabled={isLoading}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>←</span> Dashboard
                </button>
                <button
                  onClick={() => createNewConversation()}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  New Chat
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <h3 className="px-4 py-2 text-sm font-medium text-gray-500">Recent Chats</h3>
              <div className="space-y-1 p-2">
                {conversations.map((conv) => (
                  <div
                    key={conv?.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => {
                        if (conv?.id) {
                          setSelectedConversation(conv.id);
                          loadConversationMessages(conv.id);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg transition duration-200 ${
                        selectedConversation === conv?.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      } flex justify-between items-start`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{conv?.title || 'Untitled Conversation'}</div>
                        <div className="text-xs text-gray-500">
                          {conv?.updated_at ? formatRelativeTime(conv.updated_at) : ''}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Delete conversation"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={goToHome}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  title="Go to dashboard"
                >
                  ←
                </button>
                <h1 className="text-xl font-semibold text-gray-800">AI Chatbot</h1>
              </div>
              <div className="text-sm text-gray-600">Welcome, {user?.name?.toUpperCase() || user?.email?.split('@')[0]?.toUpperCase()}</div>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <h3 className="text-xl font-medium mb-2">Welcome to the AI Chatbot</h3>
                    <p>Start a conversation by sending a message below.</p>
                    <p className="mt-2 text-sm">Try: "Add a task to buy groceries"</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.role === 'user'}
                />
              ))}

              {isLoading && selectedConversation && (
                <MessageBubble
                  message={{
                    id: 'loading',
                    role: 'assistant',
                    content: 'Thinking...',
                    timestamp: new Date().toISOString(),
                  }}
                  isOwnMessage={false}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 bg-white p-4">
              <MessageInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onSend={handleSendMessage}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};