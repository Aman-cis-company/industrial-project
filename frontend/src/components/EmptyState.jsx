import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-xl min-h-[300px] transition-colors duration-200">
      {Icon && (
        <div className="p-4 bg-surface dark:bg-surface-dark text-text-muted dark:text-text-muted-dark rounded-full mb-4">
          <Icon className="w-8 h-8 shrink-0" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
        {title || 'No data found'}
      </h3>
      <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark max-w-sm">
        {description || 'There is currently no data in this module. Create a new record to get started.'}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-1.5 bg-accent dark:bg-accent-dark hover:bg-accent-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          {action.icon || <Plus className="w-3.5 h-3.5 shrink-0" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
