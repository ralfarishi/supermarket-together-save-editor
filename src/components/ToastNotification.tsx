import React, { useEffect } from 'react';
import { X, CheckCircle, Warning, Info } from '@phosphor-icons/react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const config = {
    success: {
      border: 'border-led-green',
      text: 'text-led-green',
      icon: <CheckCircle size={20} className="text-led-green" />,
      title: 'SCAN OK',
    },
    error: {
      border: 'border-laser-red',
      text: 'text-laser-red',
      icon: <Warning size={20} className="text-laser-red" />,
      title: 'SCAN ERR',
    },
    info: {
      border: 'border-terminal-amber',
      text: 'text-terminal-amber',
      icon: <Info size={20} className="text-terminal-amber" />,
      title: 'SYS INFO',
    },
  }[toast.type];

  return (
    <div
      className={`flex items-start gap-3 w-80 p-4 bg-bg-card border-2 ${config.border} rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] font-mono animate-in fade-in slide-in-from-right-10 duration-200`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
          [{config.title}]
        </p>
        <p className="mt-1 text-sm text-off-white font-mono break-words leading-tight">
          {toast.text}
        </p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-off-white/40 hover:text-off-white hover:scale-110 active:scale-95 transition-all p-0.5 cursor-pointer"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
