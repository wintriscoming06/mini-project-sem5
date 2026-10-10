import React from 'react';
import renderIcon from './renderIcon';

const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder, 
  options = [], 
  required = false, 
  disabled = false, 
  icon, 
  className = '' 
}) => {
  const baseClasses = `mt-1 block w-full rounded-lg text-sm transition-colors border shadow-sm ${
    error 
      ? 'border-rose-400 dark:border-rose-600 text-rose-900 dark:text-rose-200 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20' 
      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
  } ${icon ? 'pl-10' : 'px-3 py-2'} ${disabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''} ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-emerald-500 dark:text-emerald-400">*</span>}
        </label>
      )}
      
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseClasses} px-3 py-2`}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="dark:bg-[#081b29]">
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseClasses} px-3 py-2`}
        />
      ) : (
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {renderIcon(icon, 'h-4 w-4 text-slate-400 dark:text-slate-500')}
            </div>
          )}
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClasses}
          />
        </div>
      )}
      
      {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
};

export default FormInput;
