import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, dismissible = true, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !message) return null;

  const styles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60',
    error: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/60',
    info: 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800/60'
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
    error: <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 flex-shrink-0" />
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className={`flex items-center p-4 border rounded-xl ${styles[type] || styles.info} mb-4 shadow-sm`}>
      <div className="flex-shrink-0">
        {icons[type] || icons.info}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {dismissible && (
        <div className="ml-auto pl-3">
          <button 
            onClick={handleClose} 
            className="inline-flex rounded-lg p-1.5 focus:outline-none hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Alert;
