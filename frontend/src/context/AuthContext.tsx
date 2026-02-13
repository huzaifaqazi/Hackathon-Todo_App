import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService from '../services/auth';
import { User } from '../types/user';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Only check auth if we're in the browser
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('access_token');

        if (token) {
          // Token exists, try to validate it
          try {
            await getCurrentUser();
            setIsAuthenticated(true);
          } catch (error: any) {
            console.error('Token validation failed:', error);

            // Only clear token if it's definitely invalid (401/403)
            // Don't clear on network errors
            if (error.message?.includes('Authentication failed') ||
                error.response?.status === 401 ||
                error.response?.status === 403) {
              localStorage.removeItem('access_token');
              setIsAuthenticated(false);
              setUser(null);
            } else {
              // Network error or other issue - keep token and retry later
              console.warn('Auth check failed but keeping token for retry');
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } else {
          // No token exists
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      // Ensure authentication state is properly reset on login failure
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => {
    try {
      const response = await authService.register(userData);

      if (response.success) {
        // Optionally log the user in after registration
        await login(userData.email, userData.password);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      // Ensure authentication state is properly reset on registration failure
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear local state
    } finally {
      // Always clear the local state after logout attempt
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
    }
  };

  const getCurrentUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser; // Return the user data for calling functions to use
    } catch (error: any) {
      console.error('Failed to get current user:', error);

      // Only clear token and state if it's an authentication error
      // Don't clear on network errors
      if (!error.isNetworkError) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
      }

      throw error; // Re-throw the error so calling functions can handle it
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};