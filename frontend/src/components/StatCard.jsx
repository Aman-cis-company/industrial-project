import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, subtitle }) => {
  const isPositive = trend?.isPositive;
  const isNegative = trend?.isNegative;
  const trendValue = trend?.value;

  return (
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm rounded-xl p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide font-semibold text-text-muted dark:text-text-muted-dark">
          {label}
        </span>
        {Icon && (
          <div className="p-2 bg-background dark:bg-background-dark text-brand dark:text-brand-dark rounded-lg">
            <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-semibold font-technical tracking-tight text-text-primary dark:text-text-primary-dark">
          {value}
        </span>
        {trendValue && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : isNegative
                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                : 'bg-background dark:bg-background-dark text-text-muted dark:text-text-muted-dark'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" strokeWidth={1.5} />
            ) : isNegative ? (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" strokeWidth={1.5} />
            ) : (
              <Minus className="w-3.5 h-3.5 mr-0.5 shrink-0" strokeWidth={1.5} />
            )}
            {trendValue}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-text-muted dark:text-text-muted-dark">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
