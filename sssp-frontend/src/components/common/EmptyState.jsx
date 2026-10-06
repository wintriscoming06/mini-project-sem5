import React from 'react';
import Button from './Button';
import renderIcon from './renderIcon';

// `icon` may be a component (icon={Trophy}) or an element (icon={<Trophy />}).
// The call sites also pass `message` (alias of `description`) and `action` (a ready-made node,
// e.g. a button or link); the original `actionText` + `onAction` pair is still supported.
const EmptyState = ({ icon, title, description, message, action, actionText, onAction }) => {
  const text = description || message;
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      {icon && <div className="flex justify-center">{renderIcon(icon, 'h-12 w-12 text-gray-400')}</div>}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {text && <p className="mt-1 text-sm text-gray-500">{text}</p>}
      {action ? (
        <div className="mt-6">{action}</div>
      ) : (
        actionText && onAction && (
          <div className="mt-6">
            <Button onClick={onAction} variant="primary">
              {actionText}
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default EmptyState;
