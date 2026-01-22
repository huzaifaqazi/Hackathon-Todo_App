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
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasCheckedAuth(true);
      if (!isAuthenticated) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  // Show loading state while checking auth status
  if (loading || !hasCheckedAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authenticated, render the children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading, return null (will be redirected by useEffect)
  return null;
};

export default ProtectedRoute;