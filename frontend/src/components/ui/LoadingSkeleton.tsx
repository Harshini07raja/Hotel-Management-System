import React from 'react';

interface LoadingSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  variant?: 'hotel-card' | 'list-item' | 'stat-card' | 'table-row' | 'text-block';
  className?: string;
}

const HotelCardSkeleton: React.FC = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-52 rounded-none" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-aurevia-border">
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-9 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

const ListItemSkeleton: React.FC = () => (
  <div className="card card-padding flex items-center gap-4">
    <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-4 w-48 rounded" />
      <div className="skeleton h-3 w-72 rounded" />
    </div>
    <div className="skeleton h-8 w-24 rounded-lg shrink-0" />
  </div>
);

const StatCardSkeleton: React.FC = () => (
  <div className="card card-padding space-y-3">
    <div className="skeleton h-3 w-24 rounded" />
    <div className="skeleton h-8 w-32 rounded" />
    <div className="skeleton h-3 w-16 rounded" />
  </div>
);

const TableRowSkeleton: React.FC = () => (
  <tr>
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 rounded" style={{ width: `${60 + i * 10}%` }} />
      </td>
    ))}
  </tr>
);

const TextBlockSkeleton: React.FC = () => (
  <div className="space-y-2">
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-5/6 rounded" />
    <div className="skeleton h-4 w-4/5 rounded" />
  </div>
);

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  variant = 'hotel-card',
  className = '',
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'hotel-card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {items.map((i) => <HotelCardSkeleton key={i} />)}
      </div>
    );
  }

  if (variant === 'list-item') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => <ListItemSkeleton key={i} />)}
      </div>
    );
  }

  if (variant === 'stat-card') {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <>
        {items.map((i) => <TableRowSkeleton key={i} />)}
      </>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((i) => <TextBlockSkeleton key={i} />)}
    </div>
  );
};
