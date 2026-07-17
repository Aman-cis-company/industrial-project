import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl min-h-[300px]">
      {Icon && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full mb-4">
          <Icon className="w-8 h-8 shrink-0" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {title || 'No data found'}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {description || 'There is currently no data in this module. Create a new record to get started.'}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          {action.icon || <Plus className="w-3.5 h-3.5 shrink-0" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
