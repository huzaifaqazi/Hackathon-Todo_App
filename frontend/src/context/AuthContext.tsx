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
        if (authService.isAuthenticated()) {
          await getCurrentUser();
          setIsAuthenticated(true);
        } else {
          // If no token exists, explicitly set as not authenticated
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear any invalid token
        localStorage.removeItem('access_token');
        // Explicitly set as not authenticated after clearing invalid token
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
    } catch (error) {
      console.error('Failed to get current user:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
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