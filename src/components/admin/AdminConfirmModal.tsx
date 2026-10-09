import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ShieldAlert, LogOut, Check, X } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  details?: { label: string; value: string }[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const AdminConfirmModal: React.FC<ConfirmModalConfig> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'warning',
  details = [],
  onConfirm,
  onCancel,
}) => {
  useBodyScrollLock(isOpen);

  if (!isOpen || typeof document === 'undefined') return null;

  const variantIcons = {
    danger: <ShieldAlert className="w-8 h-8 text-rose-500" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    info: <LogOut className="w-8 h-8 text-cyan-400" />,
  };

  const confirmBtnStyles = {
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
    warning: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/30',
    info: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-500/30',
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex-shrink-0">
            {variantIcons[variant]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono leading-snug">
              {title}
            </h3>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              {variant === 'danger' ? 'Irreversible Action' : 'Administrative Confirmation Required'}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {message}
        </p>

        {details.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono">
            {details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-400">
                <span>{item.label}:</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold shadow-lg transition-all active:scale-95 flex items-center gap-1.5 ${confirmBtnStyles[variant]}`}
          >
            <Check className="w-4 h-4" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
