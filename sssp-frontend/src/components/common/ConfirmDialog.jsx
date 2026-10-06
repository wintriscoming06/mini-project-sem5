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
  cancelText = 'Cancel'
}) => {
  const getIcon = () => {
    if (variant === 'danger') return <AlertTriangle className="h-6 w-6 text-red-600" />;
    if (variant === 'warning') return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <Info className="h-6 w-6 text-primary-600" />;
  };

  const getConfirmVariant = () => {
    if (variant === 'danger') return 'danger';
    if (variant === 'warning') return 'primary';
    return 'primary';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start mt-2">
        <div className="flex-shrink-0 mr-4">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
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
