import React, { useEffect } from 'react';
import { AlertTriangle, Info, Loader2, X } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
  loading = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  // Variant-specific icons and button styling
  const variantConfig = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
      iconBg: 'bg-rose-100',
      confirmButtonClass:
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-100',
      confirmButtonClass:
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
    },
    info: {
      icon: <Info className="w-6 h-6 text-aurevia-forest" />,
      iconBg: 'bg-emerald-100',
      confirmButtonClass: 'btn-primary',
    },
  };

  const currentVariant = variantConfig[variant] || variantConfig.info;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl relative animate-slide-up border border-aurevia-border/60">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-aurevia-muted hover:text-aurevia-charcoal p-1 rounded-lg transition-colors disabled:opacity-40"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 rounded-full ${currentVariant.iconBg} flex items-center justify-center mb-4 shadow-sm`}
          >
            {currentVariant.icon}
          </div>

          <h3
            id="confirmation-dialog-title"
            className="font-display text-xl font-bold text-aurevia-charcoal mb-2"
          >
            {title}
          </h3>

          <p className="text-sm text-aurevia-muted leading-relaxed mb-6">
            {message}
          </p>

          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-ghost flex-1 justify-center"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`${currentVariant.confirmButtonClass} flex-1 justify-center`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
