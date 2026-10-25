import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'CONFIRMED':
    case 'AVAILABLE':
    case 'CLEAN':
    case 'PAID':
    case 'SUCCESS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          {status}
        </span>
      );

    case 'CHECKED_IN':
    case 'OCCUPIED':
    case 'CLEANING':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
          {status}
        </span>
      );

    case 'DIRTY':
    case 'PENDING':
    case 'UNPAID':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          {status}
        </span>
      );

    case 'CANCELLED':
    case 'FAILED':
    case 'MAINTENANCE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
          {status}
        </span>
      );

    case 'CHECKED_OUT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
          {status}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {status}
        </span>
      );
  }
};
