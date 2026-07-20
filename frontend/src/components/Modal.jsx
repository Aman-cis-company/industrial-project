import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  // Prevent body scroll when modal is open
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
    <div className="fixed inset-0 z-150 overflow-y-auto flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      ></div>

      {/* Modal box */}
      <div
        className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-xl max-w-lg w-full z-10 overflow-hidden transform transition-all duration-200 scale-100"
        style={{
          animation: 'modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border dark:border-border-dark flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary dark:text-text-primary-dark">
            {title || 'Confirmation'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary dark:text-text-muted-dark dark:hover:text-text-primary-dark transition-colors p-1 rounded-lg hover:bg-background dark:hover:bg-background-dark"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3 border-t border-border dark:border-border-dark bg-background dark:bg-background-dark flex justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
