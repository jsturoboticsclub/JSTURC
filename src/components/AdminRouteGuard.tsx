import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft, RefreshCw } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'unauthenticated' | 'forbidden'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      // Reject missing or legacy demo tokens immediately
      if (!token || token === 'portfolio-demo-token') {
        if (token === 'portfolio-demo-token') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('authUser');
        }
        if (isMounted) setAuthState('unauthenticated');
        return;
      }

      let parsedUser: any = null;
      try {
        parsedUser = userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        parsedUser = null;
      }

      // Fast check: If role is explicitly not Admin
      if (parsedUser && parsedUser.role !== 'Admin') {
        if (isMounted) {
          setErrorMessage(`Your account (${parsedUser.email}) has role '${parsedUser.role}'. Administrator clearance is required.`);
          setAuthState('forbidden');
        }
        return;
      }

      // Authoritative verification against backend API
      try {
        const res = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (isMounted) setAuthState('unauthenticated');
          return;
        }

        if (res.status === 403) {
          // Forbidden - not an admin
          if (isMounted) {
            setErrorMessage('Your credentials do not possess Administrator clearance.');
            setAuthState('forbidden');
          }
          return;
        }

        if (res.ok) {
          if (isMounted) setAuthState('authorized');
          return;
        }

        // Unknown server failure, assume unauthenticated for safety
        if (isMounted) setAuthState('unauthenticated');
      } catch (err: any) {
        // Network error - if offline but has verified admin token in storage
        if (parsedUser && parsedUser.role === 'Admin') {
          if (isMounted) setAuthState('authorized');
        } else {
          if (isMounted) setAuthState('unauthenticated');
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // 1. Verifying Clearance
  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center shadow-xl shadow-indigo-950/50">
            <Lock className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border border-indigo-500/20 animate-ping pointer-events-none" />
        </div>
        <h2 className="text-lg font-black tracking-tight text-white mb-1">
          Verifying Security Clearance...
        </h2>
        <p className="text-xs font-mono text-indigo-300/70 tracking-wide uppercase">
          Enforcing JSTU Admin Protocol
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: Redirect directly to login with return destination
  if (authState === 'unauthenticated') {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 3. Authenticated but Insufficient Permissions (Forbidden)
  if (authState === 'forbidden') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 shadow-lg shadow-red-950/50">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-red-950/80 border border-red-500/30 text-red-400 mb-3">
            403 · Access Denied
          </span>

          <h1 className="text-2xl font-black text-white mb-2">
            Administrator Clearance Required
          </h1>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {errorMessage || 'This control matrix is strictly restricted to club executives and system administrators.'}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Go to Member Dashboard</span>
            </Link>

            <Link
              to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sign In with Different Account</span>
            </Link>

            <Link
              to="/"
              className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized: Render the Admin Panel
  return <>{children}</>;
};

export default AdminRouteGuard;
