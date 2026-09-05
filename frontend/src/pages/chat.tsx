import React from 'react';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ChatInterface } from '../components/ChatInterface';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

const ChatPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="h-[calc(100vh-64px)] bg-surface-background p-6">
          <Head>
            <title>AI Assistant — TodoApp</title>
          </Head>
          <div className="max-w-5xl mx-auto h-full">
            {user && <ChatInterface userId={user.id} />}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ChatPage;
