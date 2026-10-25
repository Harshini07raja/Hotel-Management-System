import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  /**
   * Accepts either:
   * - A Lucide component reference: icon={Users}
   * - A pre-rendered JSX element: icon={<Users className="w-5 h-5" />}
   */
  icon?: React.ElementType | React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  accent?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sub,
  icon,
  trend,
  trendValue,
  className = '',
  accent = false,
}) => {
  // React.isValidElement distinguishes rendered JSX from a component reference.
  // Lucide icons in v0.453+ are forwardRef objects (typeof === 'object'), so
  // the old `typeof icon === 'function'` check broke them. We now check
  // isValidElement first: if true it's already rendered; otherwise call it as
  // a component.
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      // Already rendered JSX: <Users className="w-5 h-5" />
      return icon;
    }
    // Component reference (function or forwardRef object): icon={Users}
    const Icon = icon as React.ElementType;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className={`card card-padding flex items-start gap-4 ${accent ? 'bg-aurevia-forest text-white border-aurevia-forest' : ''} ${className}`}>
      {icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          accent ? 'bg-white/10 text-aurevia-gold' : 'bg-aurevia-ivory-dark text-aurevia-forest'
        }`}>
          {renderIcon()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${accent ? 'text-aurevia-gold/80' : 'text-aurevia-muted'}`}>
          {label}
        </p>
        <p className={`text-2xl font-bold font-mono leading-none ${accent ? 'text-white' : 'text-aurevia-charcoal'}`}>
          {value}
        </p>
        {(sub || trendValue) && (
          <div className="flex items-center gap-2 mt-1">
            {sub && (
              <span className={`text-xs ${accent ? 'text-white/60' : 'text-aurevia-muted'}`}>{sub}</span>
            )}
            {trend && trendValue && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
