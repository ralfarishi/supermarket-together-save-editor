import React from 'react';
import { X } from '@phosphor-icons/react';

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  severity = 'info',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const severityColor = {
    warning: 'border-warning-brass text-warning-brass',
    error: 'border-laser-red text-laser-red',
    info: 'border-terminal-amber text-terminal-amber',
  }[severity];

  const buttonConfirmColor = {
    warning: 'bg-warning-brass hover:bg-warning-brass/90 text-bg-charcoal',
    error: 'bg-laser-red hover:bg-laser-red/90 text-off-white',
    info: 'bg-terminal-amber hover:bg-terminal-amber/90 text-bg-charcoal',
  }[severity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-charcoal/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md bg-bg-card border-2 ${severityColor} p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.6)] font-mono flex flex-col gap-4 animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center border-b border-off-white/10 pb-3">
          <h2 className="text-lg font-bold tracking-widest uppercase">
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="text-off-white/40 hover:text-off-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-off-white/80 leading-relaxed font-mono whitespace-pre-wrap">
          {description}
        </p>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-off-white/20 text-off-white hover:bg-off-white/10 active:scale-95 transition-all text-xs font-bold cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold active:scale-95 transition-all cursor-pointer ${buttonConfirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
