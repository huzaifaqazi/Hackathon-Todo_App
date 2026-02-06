import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface CreateConversationRequest {
  initial_message: string;
}

interface CreateConversationResponse {
  conversation: {
    id: string;
    title: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };
}

interface GetConversationsResponse {
  conversations: Array<{
    id: string;
    title: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
  }>;
}

interface GetMessageResponse {
  messages: Array<{
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    tool_calls?: string;
    tool_responses?: string;
    message_type: 'text' | 'tool_result' | 'feedback';
  }>;
}

interface SendMessageRequest {
  message: string;
  stream?: boolean;
}

interface SendMessageResponse {
  response: {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    tool_calls?: string;
    tool_responses?: string;
    message_type: 'text' | 'tool_result' | 'feedback';
  };
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 60000, // 60 seconds timeout
});

// Add authorization header to all requests if token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Using the correct token key from AuthContext
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally with more detailed logging
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config,
    });

    // Log specific error details for debugging
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Network Error: Request was made but no response received');
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export const chatApi = {
  /**
   * Create a new conversation
   */
  async createConversation(request: CreateConversationRequest): Promise<CreateConversationResponse> {
    try {
      const response = await apiClient.post<CreateConversationResponse>('/chat/conversations', request);
      return response.data;
    } catch (error: any) {
      console.error('Error creating conversation:', error);

      // Check if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error when creating conversation:', error.response.data);
        throw new Error(`Authentication failed: ${error.response.data.detail || 'Not authenticated'}`);
      }

      throw error;
    }
  },

  /**
   * Get all conversations for the current user
   */
  async getUserConversations(): Promise<GetConversationsResponse> {
    try {
      const response = await apiClient.get<GetConversationsResponse>('/chat/conversations');
      return response.data;
    } catch (error: any) {
      console.error('Error getting conversations:', error);

      // Check if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error when getting conversations:', error.response.data);
        throw new Error(`Authentication failed: ${error.response.data.detail || 'Not authenticated'}`);
      }

      throw error;
    }
  },

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string) {
    try {
      const response = await apiClient.get(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting conversation:', error);

      // Check if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error when getting conversation:', error.response.data);
        throw new Error(`Authentication failed: ${error.response.data.detail || 'Not authenticated'}`);
      }

      throw error;
    }
  },

  /**
   * Delete a conversation by ID
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await apiClient.delete(`/chat/conversations/${conversationId}`);
    } catch (error: any) {
      console.error('Error deleting conversation:', error);

      // Check if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error when deleting conversation:', error.response.data);
        throw new Error(`Authentication failed: ${error.response.data.detail || 'Not authenticated'}`);
      }

      throw error;
    }
  },

  /**
   * Get messages for a specific conversation
   */
  async getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<GetMessageResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await apiClient.get<GetMessageResponse>(
        `/chat/conversations/${conversationId}/messages?${params}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting conversation messages:', error);

      // Check if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error when getting conversation messages:', error.response.data);
        throw new Error(`Authentication failed: ${error.response.data.detail || 'Not authenticated'}`);
      }

      throw error;
    }
  },

  /**
   * Send a message to the AI in a specific conversation
   */
  async sendMessage(conversationId: string, message: string, stream: boolean = false): Promise<SendMessageResponse> {
    try {
      const request: SendMessageRequest = { message, stream };
      const response = await apiClient.post<SendMessageResponse>(
        `/chat/conversations/${conversationId}/chat`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Check if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error when sending message:', error.response.data);
        throw new Error(`Authentication failed: ${error.response.data.detail || 'Not authenticated'}`);
      }

      throw error;
    }
  },
};