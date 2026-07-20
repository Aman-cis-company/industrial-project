import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-sm animate-pulse transition-colors duration-200">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-border dark:bg-border-dark animate-pulse rounded w-24"></div>
      <div className="w-9 h-9 bg-border dark:bg-border-dark animate-pulse rounded-lg"></div>
    </div>
    <div className="mt-4 h-8 bg-border dark:bg-border-dark animate-pulse rounded w-32"></div>
    <div className="mt-2 h-3 bg-background dark:bg-background-dark animate-pulse rounded w-44"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm animate-pulse transition-colors duration-200">
    <div className="p-4 bg-background dark:bg-background-dark border-b border-border dark:border-border-dark flex gap-4">
      <div className="h-9 bg-border dark:bg-border-dark animate-pulse rounded-lg w-1/3"></div>
      <div className="h-9 bg-border dark:bg-border-dark animate-pulse rounded-lg w-20"></div>
    </div>
    <div className="p-4 border-b border-border dark:border-border-dark flex gap-6">
      {Array(cols).fill(0).map((_, i) => (
        <div key={i} className="h-4 bg-border dark:bg-border-dark animate-pulse rounded flex-1"></div>
      ))}
    </div>
    <div className="divide-y divide-border dark:divide-border-dark">
      {Array(rows).fill(0).map((_, rIndex) => (
        <div key={rIndex} className="p-4 flex gap-6">
          {Array(cols).fill(0).map((_, cIndex) => (
            <div
              key={cIndex}
              className={`h-4 bg-background dark:bg-background-dark animate-pulse rounded flex-1 ${
                cIndex === 0 ? 'w-2/3' : 'w-full'
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TableSkeleton rows={4} cols={5} />
      </div>
      <div>
        <TableSkeleton rows={4} cols={3} />
      </div>
    </div>
  </div>
);

const LoadingSkeleton = {
  Card: CardSkeleton,
  Table: TableSkeleton,
  Dashboard: DashboardSkeleton
};

export default LoadingSkeleton;
