import React from 'react';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({ title, breadcrumbs = [], action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />}
                <span className={idx === breadcrumbs.length - 1 ? 'text-slate-500 dark:text-slate-300 font-medium' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        
        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans m-0">
          {title}
        </h1>
      </div>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer select-none"
        >
          {action.icon && <action.icon className="w-4 h-4 shrink-0" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default PageHeader;
