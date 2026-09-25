import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'unauthenticated'>('checking');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'portfolio-demo-token') {
      if (token === 'portfolio-demo-token') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authUser');
      }
      setAuthState('unauthenticated');
      return;
    }

    setAuthState('authorized');
  }, [location.pathname]);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">
          Verifying Member Session...
        </p>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
