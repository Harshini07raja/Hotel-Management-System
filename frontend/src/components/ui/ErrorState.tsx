import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We were unable to load this content. Please try again.',
  onRetry,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h3 className="font-display text-xl font-semibold text-aurevia-charcoal mb-2">{title}</h3>
    <p className="text-aurevia-muted text-sm max-w-sm leading-relaxed">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-6 btn-primary text-sm px-5 py-2.5">
        Try Again
      </button>
    )}
  </div>
);
