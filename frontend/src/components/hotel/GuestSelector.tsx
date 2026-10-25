import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface GuestSelectorProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const GuestSelector: React.FC<GuestSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 8,
  className = '',
}) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Minus Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-9 h-9 border border-aurevia-border hover:border-aurevia-forest hover:text-aurevia-forest text-aurevia-charcoal bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-full flex items-center justify-center shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-aurevia-forest/20"
        aria-label="Decrease guest count"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Count Display */}
      <div className="flex flex-col items-center justify-center min-w-[3.5rem]">
        <span className="w-8 text-center font-semibold text-aurevia-charcoal text-base leading-tight font-mono">
          {value}
        </span>
        <span className="text-xs text-aurevia-muted font-normal leading-tight">
          {value === 1 ? 'Guest' : 'Guests'}
        </span>
      </div>

      {/* Plus Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-9 h-9 border border-aurevia-border hover:border-aurevia-forest hover:text-aurevia-forest text-aurevia-charcoal bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-full flex items-center justify-center shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-aurevia-forest/20"
        aria-label="Increase guest count"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default GuestSelector;
