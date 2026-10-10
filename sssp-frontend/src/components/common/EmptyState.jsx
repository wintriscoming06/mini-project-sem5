import React from 'react';
import Button from './Button';
import renderIcon from './renderIcon';
import { FootballIcon } from './FootballIcons';

const EmptyState = ({ icon, title, description, message, action, actionText, onAction }) => {
  const text = description || message;
  return (
    <div className="relative text-center py-12 px-6 border-2 border-dashed border-slate-200 dark:border-emerald-900/30 rounded-xl bg-slate-50/50 dark:bg-[#071724]/40 overflow-hidden">
      <div className="flex justify-center mb-3">
        {icon ? (
          <div className="p-3 rounded-full bg-slate-100 dark:bg-emerald-950/40 text-slate-400 dark:text-emerald-400">
            {renderIcon(icon, 'h-8 w-8')}
          </div>
        ) : (
          <div className="p-3 rounded-full bg-slate-100 dark:bg-emerald-950/40 text-slate-400 dark:text-emerald-400">
            <FootballIcon className="h-8 w-8" />
          </div>
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {text && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{text}</p>}
      {action ? (
        <div className="mt-5">{action}</div>
      ) : (
        actionText && onAction && (
          <div className="mt-5">
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
