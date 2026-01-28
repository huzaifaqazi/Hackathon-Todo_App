import React from 'react';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;