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
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 shadow-md shadow-indigo-500/25 mx-auto mb-3">
              <div className="w-full h-full bg-white dark:bg-[#0B1120] rounded-[14px] flex items-center justify-center">
                <Cpu className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">JSTU Robotics Portal</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Jamalpur Science & Technology University</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Apply to Join
            </button>
            <button
              onClick={() => { setMode('forgot'); setError(null); setSuccess(null); setRecoveryStep(1); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'forgot'
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

              {/* Demo Shortcuts */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block text-center mb-2 uppercase font-bold tracking-wider">
                  ⚡ Quick Demo Login Shortcuts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@jstu.edu');
                      setPassword('admin123');
                      handleSignIn(undefined, 'admin@jstu.edu', 'admin123');
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all text-center shadow-xs"
                  >
                    👑 Admin Login
                    <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-mono">admin@jstu.edu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('member@jstu.edu');
                      setPassword('member123');
                      handleSignIn(undefined, 'member@jstu.edu', 'member123');
                    }}
                    className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-800 dark:text-indigo-300 text-xs font-bold transition-all text-center shadow-xs"
                  >
                    🤖 Member Login
                    <span className="block text-[10px] text-indigo-700 dark:text-indigo-400 font-mono">member@jstu.edu</span>
                  </button>
                </div>
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