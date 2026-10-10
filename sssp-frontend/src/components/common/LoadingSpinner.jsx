import React from 'react';
import { FootballIcon } from './FootballIcons';

const LoadingSpinner = ({ size = 'md', fullWidth, fullScreen = false, text }) => {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    large: 'h-12 w-12'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <div className={`animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500 ${sizes[size] || sizes.md}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <FootballIcon className={`text-emerald-500/60 ${size === 'lg' || size === 'large' ? 'w-5 h-5' : size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
        </div>
      </div>
      {text && (
        <p className="text-sm font-medium text-slate-500 dark:text-emerald-400/80 animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-[#06131b]/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-6 ${fullWidth ? 'w-full' : ''}`}>
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
