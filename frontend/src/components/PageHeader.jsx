import React from 'react';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({ title, breadcrumbs = [], action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-text-muted dark:text-text-muted-dark mb-1.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-text-muted dark:text-text-muted-dark shrink-0" strokeWidth={1.5} />}
                <span className={idx === breadcrumbs.length - 1 ? 'text-text-primary dark:text-text-primary-dark font-medium' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        
        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary dark:text-text-primary-dark font-sans m-0">
          {title}
        </h1>
      </div>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center gap-2 bg-brand dark:bg-brand-dark hover:bg-brand-hover dark:hover:bg-brand-hover-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm cursor-pointer select-none"
        >
          {action.icon && <action.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default PageHeader;
