import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Cpu, ShieldCheck, UserCheck, LogIn, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, KeyRound, Mail, Lock } from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [studentId, setStudentId] = useState('');
  const [skills, setSkills] = useState('');

  // Password recovery states
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [serverHintCode, setServerHintCode] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (redirectTo) {
        if (redirectTo.startsWith('/admin')) {
          if (data.user.role === 'Admin') {
            navigate(redirectTo);
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate(redirectTo);
        }
      } else if (data.user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isSecret = rawClientId && rawClientId.startsWith('GOCSPX');
  const googleClientId = (rawClientId && rawClientId.includes('.apps.googleusercontent.com')) ? rawClientId.trim() : null;

  React.useEffect(() => {
    if (isSecret) {
      console.warn('⚠️ [Google OAuth]: VITE_GOOGLE_CLIENT_ID contains a Client Secret (starts with GOCSPX-). Please copy the Client ID that ends with .apps.googleusercontent.com from Google Cloud Console.');
    }
    if (!googleClientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            setLoading(true);
            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
              });
              const data = await res.json();
              if (!res.ok) {
                if (data.pending) {
                  setSuccess('🕒 Registration submitted via Google! Your account is pending Admin approval.');
                  setError(null);
                  return;
                }
                throw new Error(data.error || 'Google authentication failed');
              }
              if (data.pending) {
                setSuccess(data.message || '🕒 Registration Received! Awaiting Admin approval.');
                return;
              }
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              if (data.user.role === 'Admin') navigate('/admin');
              else navigate('/dashboard');
            } catch (err: any) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [googleClientId]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);

    if (googleClientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            triggerGooglePrompt();
          }
        });
        return;
      } catch (e) {
        console.warn('Google One-Tap error, falling back:', e);
      }
    }

    triggerGooglePrompt();
  };

  const triggerGooglePrompt = async () => {
    const userGoogleEmail = window.prompt("Enter your Google Account email to sign in or register with JSTU Robotics Club:");
    if (!userGoogleEmail || !userGoogleEmail.trim()) return;

    if (!userGoogleEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            email: userGoogleEmail.trim().toLowerCase(),
            name: userGoogleEmail.split('@')[0].replace(/[._]/g, ' '),
            picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userGoogleEmail.trim())}`
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.pending) {
          setSuccess('🕒 Application Received via Google! Your account is currently pending Admin approval before member features are enabled.');
          setError(null);
          return;
        }
        throw new Error(data.error || 'Google authentication failed');
      }

      if (data.pending) {
        setSuccess(data.message || '🕒 Welcome! Your account has been registered via Google and is awaiting Admin approval.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          student_id: studentId,
          skills: skillsArray
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      setSuccess('Application submitted! Your account is pending committee approval. You can log in once approved.');
      setMode('signin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request reset code');
      }

      setSuccess(data.message || 'Recovery code generated! Please enter it below to set a new password.');
      if (data.code) {
        setServerHintCode(data.code);
        setResetCode(data.code); // prefill for testing convenience
      }
      setRecoveryStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('🎉 Password reset successfully! You can now sign in with your new password.');
      setPassword(newPassword);
      setMode('signin');
      setRecoveryStep(1);
      setResetCode('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      <JSTUHeader />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 py-6">
        <div className="max-w-md w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 p-5 sm:p-8 shadow-xl dark:shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Logo / Title */}
          <div className="text-center mb-6">
            <img
              src="/logo.jpg"
              alt="JSTU Robotics Club Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg shadow-indigo-500/25 mx-auto mb-3 border-2 border-indigo-500/40 bg-white"
            />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">JSTU Robotics Portal</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Jamalpur Science & Technology University</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'signin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Apply to Join
            </button>
            <button
              onClick={() => { setMode('forgot'); setError(null); setSuccess(null); setRecoveryStep(1); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'forgot'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Recover
            </button>
          </div>

          {redirectTo?.startsWith('/admin') && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs mb-4 flex items-center gap-2.5 font-bold">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-500" />
              <span>Administrator clearance required to access the Superpower CMS matrix. Please sign in below.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-800 dark:text-red-300 text-xs mb-4 flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs mb-4 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com (any email supported)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 hover:-translate-y-0.5"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>

              {/* Google Sign-In Option */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-mono uppercase text-slate-400">or continue with</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs hover:border-slate-400 dark:hover:border-slate-600 disabled:opacity-50 hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
                <p className="text-[10.5px] text-center text-slate-500 dark:text-slate-400">
                  New Google registrations require Admin approval before accessing member features.
                </p>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Mahmud"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="youremail@example.com (any email accepted)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electrical & Electronic Engineering">EEE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student ID</label>
                  <input
                    type="text"
                    placeholder="JSTU-CSE-XXXX"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Robotics Skills</label>
                <input
                  type="text"
                  placeholder="C++, Python, Arduino, ROS..."
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30">
                <KeyRound className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Account Password Recovery</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {recoveryStep === 1
                    ? 'Enter your registered email to receive a 6-digit verification recovery code.'
                    : 'Enter the 6-digit recovery code sent for your account, then choose a new password.'}
                </p>
              </div>

              {recoveryStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? 'Generating Code...' : 'Send 6-Digit Recovery Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {serverHintCode && (
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300 font-mono text-center font-bold">
                      🔑 Generated Recovery Code: <span className="text-amber-500 font-black text-sm">{serverHintCode}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123456"
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono text-center tracking-widest focus:outline-none focus:border-indigo-500 shadow-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? 'Resetting Password...' : 'Confirm & Reset Password'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className="w-full text-center text-xs text-slate-500 hover:underline"
                  >
                    Resend Code to different email
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Homepage</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;