import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, children, footer }) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out opacity-100"
          aria-hidden="true"
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          {/* Slide-over panel */}
          <div
            className="pointer-events-auto w-screen max-w-xl transform transition-transform duration-300 ease-in-out bg-surface dark:bg-surface-dark border-l border-border dark:border-border-dark shadow-2xl flex flex-col h-full animate-slide-in-right-drawer transition-colors duration-200"
            style={{
              animation: 'slideInDrawer 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border dark:border-border-dark flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary dark:text-text-primary-dark" id="slide-over-title">
                {title || 'Configuration Panel'}
              </h2>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary dark:text-text-muted-dark dark:hover:text-text-primary-dark transition-colors p-1.5 hover:bg-background dark:hover:bg-background-dark rounded-lg"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {children}
            </div>

            {/* Optional Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-border dark:border-border-dark bg-background dark:bg-background-dark flex justify-end gap-3">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
