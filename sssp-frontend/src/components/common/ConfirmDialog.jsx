import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  variant = 'default',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onCancel
}) => {
  const handleClose = onClose || onCancel;

  const getIcon = () => {
    if (variant === 'danger') return <AlertTriangle className="h-6 w-6 text-rose-500" />;
    if (variant === 'warning') return <AlertTriangle className="h-6 w-6 text-amber-500" />;
    return <Info className="h-6 w-6 text-emerald-500" />;
  };

  const getConfirmVariant = () => {
    if (variant === 'danger') return 'danger';
    if (variant === 'warning') return 'primary';
    return 'primary';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="flex items-start mt-2">
        <div className="flex-shrink-0 mr-4">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="secondary" onClick={handleClose}>
          {cancelText}
        </Button>
        <Button variant={getConfirmVariant()} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
