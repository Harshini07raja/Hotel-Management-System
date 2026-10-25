import React from 'react';

interface EmptyStateProps {
  /**
   * Accepts either:
   * - A Lucide component reference: icon={Users}
   * - A pre-rendered JSX element: icon={<Users />}
   */
  icon?: React.ElementType | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}) => {
  const padding = size === 'sm' ? 'py-8 px-4' : 'py-16 px-6';
  const wrapSize = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';

  // Same fix as MetricCard: use React.isValidElement to distinguish rendered
  // JSX from a component reference. Lucide v0.453+ icons are forwardRef objects,
  // so typeof === 'object' — the old typeof === 'function' guard broke them.
  const renderIcon = () => {
    if (!icon) return (
      <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    );
    if (React.isValidElement(icon)) {
      // Already rendered JSX: <Bell className="w-8 h-8" />
      return icon;
    }
    // Component reference (function or forwardRef object): icon={Bell}
    const Icon = icon as React.ElementType;
    return <Icon className={iconSize} />;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${padding} text-center ${className}`}>
      <div className={`${wrapSize} bg-aurevia-ivory-dark rounded-2xl flex items-center justify-center mb-5 text-aurevia-muted`}>
        {renderIcon()}
      </div>
      <h3 className={`font-display font-semibold text-aurevia-charcoal mb-2 ${size === 'sm' ? 'text-lg' : 'text-xl'}`}>
        {title}
      </h3>
      {description && (
        <p className="text-aurevia-muted text-sm max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
