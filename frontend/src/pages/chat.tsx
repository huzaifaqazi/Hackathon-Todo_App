import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ChatInterface } from '../components/ChatInterface';
import { useAuth } from '../context/AuthContext'; // Assuming you have an auth context

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth(); // Assuming you have an auth context
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
      } else {
        // Set user ID for the chat interface
        setUserId(user.id);
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated and not loading
  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">AI Chatbot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {user?.first_name || user?.email || 'User'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md h-[calc(100vh-200px)]">
          {userId && <ChatInterface userId={userId} />}
        </div>
      </main>
    </div>
  );
};

export default ChatPage;