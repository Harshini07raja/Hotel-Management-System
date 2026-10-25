import React from 'react';

type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
type HousekeepingStatus = 'DIRTY' | 'CLEANING' | 'CLEAN' | 'INSPECTION';
type AnyStatus = RoomStatus | HousekeepingStatus;

interface RoomStatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

const CONFIG: Record<AnyStatus, { label: string; className: string; dot: string }> = {
  AVAILABLE:   { label: 'Available',   className: 'badge-green',  dot: 'bg-emerald-500' },
  RESERVED:    { label: 'Reserved',    className: 'badge-amber',  dot: 'bg-amber-500' },
  OCCUPIED:    { label: 'Occupied',    className: 'badge-blue',   dot: 'bg-blue-500' },
  MAINTENANCE: { label: 'Maintenance', className: 'badge-rose',   dot: 'bg-rose-500' },
  DIRTY:       { label: 'Dirty',       className: 'badge-rose',   dot: 'bg-rose-400' },
  CLEANING:    { label: 'Cleaning',    className: 'badge-blue',   dot: 'bg-blue-400' },
  CLEAN:       { label: 'Clean',       className: 'badge-green',  dot: 'bg-emerald-400' },
  INSPECTION:  { label: 'Inspection',  className: 'badge-purple', dot: 'bg-purple-400' },
};

export const RoomStatusBadge: React.FC<RoomStatusBadgeProps> = ({ status, className = '' }) => {
  const cfg = CONFIG[status] ?? { label: status, className: 'badge-slate', dot: 'bg-slate-400' };
  return (
    <span className={`${cfg.className} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};
