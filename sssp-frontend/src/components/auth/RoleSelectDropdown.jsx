import React, { useState, useRef, useEffect } from 'react';

const ROLE_OPTIONS = [
  {
    value: 'PLAYER',
    label: 'Player',
    icon: '⚽',
    subtitle: 'Verified GPI player card, match analytics & tournament entry',
  },
  {
    value: 'SCOUT',
    label: 'Scout',
    icon: '🔎',
    subtitle: 'Talent discovery radar, comparison metrics & shortlists',
  },
  {
    value: 'ORGANIZER',
    label: 'Organizer',
    icon: '🏟',
    subtitle: 'Tournament management, match schedules & live scoring',
  },
];

export default function RoleSelectDropdown({
  value = 'PLAYER',
  onChange,
  name = 'role',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = ROLE_OPTIONS.find((opt) => opt.value === value) || ROLE_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      // Simulate standard event for drop-in compatibility with form state
      onChange({
        target: {
          name,
          value: option.value,
        },
      });
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
        Account Role <span className="text-emerald-400">*</span>
      </label>

      {/* Dropdown trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 border ${
          isOpen
            ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20'
            : 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{selectedOption.icon}</span>
          <div>
            <span className="text-sm font-black text-white tracking-wide block">
              {selectedOption.label}
            </span>
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Hidden native input for form compatibility */}
      <input type="hidden" name={name} value={value} />

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 p-1 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-md transition-all duration-200"
        >
          {ROLE_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt)}
                className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                    : 'hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <span className="text-xl mt-0.5">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{opt.label}</span>
                    {isSelected && (
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {opt.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
