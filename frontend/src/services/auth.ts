import axios from 'axios';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

interface GetUserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

class AuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://huzaifaqazi-todo-app.hf.space';
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Check if we're in the browser (not server-side)
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        throw new Error('Not in browser environment');
      }

      const response = await axios.post(`${this.apiUrl}/api/v1/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        // Store token in localStorage using consistent key
        const token = response.data.data?.token;
        if (token) {
          localStorage.setItem('access_token', token);
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error details:', error); // Log the full error for debugging

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           error.response.statusText ||
                           'Login failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Network error: Unable to reach the server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'Login failed');
      }
    }
  }

  async register(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/v1/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration error details:', error); // Log the full error for debugging

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           error.response.statusText ||
                           'Registration failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Network error: Unable to reach the server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'Registration failed');
      }
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      // Check if we're in the browser (not server-side)
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        throw new Error('Not in browser environment');
      }

      const token = this.getTokenWithMigration();

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.post(`${this.apiUrl}/api/v1/auth/logout`, {
        token
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Remove token from localStorage
      localStorage.removeItem('access_token');

      return response.data;
    } catch (error: any) {
      console.error('Logout error details:', error); // Log the full error for debugging

      // Even if the server call fails, remove the token locally
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('access_token');
      }

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           error.response.statusText ||
                           'Logout failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Network error: Unable to reach the server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'Logout failed');
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // Check if we're in the browser (not server-side)
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        throw new Error('Not in browser environment');
      }

      const token = this.getTokenWithMigration();

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${this.apiUrl}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return response.data.data.user;
      } else {
        throw new Error('Failed to get user data');
      }
    } catch (error: any) {
      console.error('Get current user error details:', error); // Log the full error for debugging

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           error.response.statusText ||
                           'Failed to get user data';
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Network error: Unable to reach the server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'Failed to get user data');
      }
    }
  }

  // Helper method to get token with migration support
  private getTokenWithMigration(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // First check for new token key
      let token = localStorage.getItem('access_token');
      if (!token) {
        // Check for old token key and migrate it
        const oldToken = localStorage.getItem('token');
        if (oldToken) {
          // Migrate old token to new key
          localStorage.setItem('access_token', oldToken);
          localStorage.removeItem('token'); // Clean up old key
          token = oldToken;
        }
      }
      return token;
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getTokenWithMigration();
    return !!token;
  }

  getToken(): string | null {
    return this.getTokenWithMigration();
  }
}

export default new AuthService();
