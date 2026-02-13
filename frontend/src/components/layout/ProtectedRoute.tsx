import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Only redirect after loading is complete and we're sure user is not authenticated
    if (!loading) {
      if (!isAuthenticated) {
        // Check if token exists in localStorage before redirecting
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        if (!token) {
          // No token, definitely not authenticated
          router.replace(redirectTo);
        } else {
          // Token exists but auth check might have failed due to network
          // Give it a moment before redirecting
          const timer = setTimeout(() => {
            if (!isAuthenticated) {
              router.replace(redirectTo);
            }
          }, 1000);

          return () => clearTimeout(timer);
        }
      } else {
        // User is authenticated, allow rendering
        setShouldRender(true);
      }
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  // Show loading state while checking auth status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authenticated, render the children
  if (isAuthenticated && shouldRender) {
    return <>{children}</>;
  }

  // Show loading while waiting for redirect
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default ProtectedRoute;