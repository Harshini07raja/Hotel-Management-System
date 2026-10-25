import React from 'react';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const CONFIG: Record<BookingStatus, { label: string; className: string; dot: string }> = {
  PENDING:     { label: 'Pending',      className: 'badge-amber',  dot: 'bg-amber-500' },
  CONFIRMED:   { label: 'Confirmed',    className: 'badge-green',  dot: 'bg-emerald-500' },
  CHECKED_IN:  { label: 'Checked In',   className: 'badge-blue',   dot: 'bg-blue-500' },
  CHECKED_OUT: { label: 'Checked Out',  className: 'badge-purple', dot: 'bg-purple-500' },
  CANCELLED:   { label: 'Cancelled',    className: 'badge-rose',   dot: 'bg-rose-500' },
};

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, className = '' }) => {
  const cfg = CONFIG[status] ?? { label: status, className: 'badge-slate', dot: 'bg-slate-400' };
  return (
    <span className={`${cfg.className} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};
