import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
      <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
    </div>
    <div className="mt-4 h-8 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
    <div className="mt-2 h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-44"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex gap-4">
      <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
      <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
    </div>
    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-6">
      {Array(cols).fill(0).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1"></div>
      ))}
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array(rows).fill(0).map((_, rIndex) => (
        <div key={rIndex} className="p-4 flex gap-6">
          {Array(cols).fill(0).map((_, cIndex) => (
            <div
              key={cIndex}
              className={`h-4 bg-slate-100 dark:bg-slate-800/60 rounded flex-1 ${
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
