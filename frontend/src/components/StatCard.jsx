import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, subtitle }) => {
  const isPositive = trend?.isPositive;
  const isNegative = trend?.isNegative;
  const trendValue = trend?.value;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {Icon && (
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-primary dark:text-slate-200 rounded-lg">
            <Icon className="w-5 h-5 shrink-0" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-technical tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {trendValue && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                : isNegative
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
                : 'bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
            ) : isNegative ? (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
            ) : (
              <Minus className="w-3.5 h-3.5 mr-0.5 shrink-0" />
            )}
            {trendValue}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
