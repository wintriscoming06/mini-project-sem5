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
  const baseClasses = 'group relative inline-flex items-center justify-center font-bold rounded-xl btn-micro-press active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-800 text-white shadow-md shadow-emerald-950/30 border border-emerald-400/50 hover:shadow-emerald-500/25 hover:shadow-lg focus:ring-emerald-500',
    secondary: 'bg-white dark:bg-[#072418] text-slate-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-50 dark:hover:bg-[#0c3524] focus:ring-emerald-500 shadow-sm',
    success: 'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white shadow-md border border-green-400/50 focus:ring-green-500',
    danger: 'bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white shadow-md border border-rose-400/50 focus:ring-rose-500',
    outline: 'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 focus:ring-emerald-500',
    ghost: 'text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 focus:ring-emerald-500 border border-transparent'
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
      {/* Subtle grass blade highlight glow at the bottom of the button */}
      <span className="absolute bottom-0 inset-x-0 h-[2px] bg-emerald-400/30 group-hover:bg-emerald-300 transition-colors pointer-events-none" />

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
