import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home, ChevronDown, ChevronUp, ShieldAlert, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ErrorBoundary Intercepted Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      // Clear potentially corrupted session data while preserving basic theme
      const theme = localStorage.getItem('theme');
      localStorage.clear();
      if (theme) localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-red-500 selection:text-white">
          <div className="max-w-xl w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Alert Badge */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-3 bg-red-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-5 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500/40 text-red-600 dark:text-red-400">
                <AlertOctagon className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Safeguard Protocol Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Application Exception Intercepted
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                An unexpected rendering condition occurred. The safeguard system intercepted it to prevent app instability and protect your session data.
              </p>
            </div>

            {/* Error Message Pill */}
            {this.state.error && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 text-left text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm overflow-hidden">
                <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">Diagnostic Signature</span>
                <p className="truncate text-red-600 dark:text-red-400 font-semibold">{this.state.error.message}</p>
              </div>
            )}

            {/* Collapsible Trace */}
            <div className="text-left">
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors mx-auto"
              >
                <span>{this.state.showDetails ? 'Hide' : 'Inspect'} Technical Stack Details</span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && this.state.errorInfo && (
                <pre className="mt-3 p-4 rounded-2xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-normal">
                  {this.state.error?.stack}
                  {'\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                title="Clears broken browser cache and reboots"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache & Reset</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
