import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import renderIcon from './renderIcon';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  icon: Icon, 
  fullWidth = false,
  title,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-blue-600 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/40',
    ghost: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base'
  };

  const buttonClasses = `
    ${baseClasses} 
    ${variants[variant] || variants.primary} 
    ${sizes[size] || sizes.md} 
    ${fullWidth ? 'w-full' : ''} 
    ${className}
  `;

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading && <div className="mr-2"><LoadingSpinner size="sm" /></div>}
      
      {!loading && Icon && (
        <span className="mr-2 -ml-0.5 transition-transform duration-200 group-hover:scale-105">
          {renderIcon(Icon, 'h-4 w-4')}
        </span>
      )}
      
      <span className="relative z-10">{children}</span>
    </button>
  );
};


export default Button;
