/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Oswald', 'Impact', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      keyframes: {
        pageIn: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.97)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
      },
      animation: {
        'page-in': 'pageIn 0.28s ease-out both',
        'fade-in': 'fadeIn 0.2s ease-out both',
        'scale-in': 'scaleIn 0.2s ease-out both',
        'slide-down': 'slideDown 0.16s ease-out both'
      },
      colors: {
        // Clean Minimal Stadium - Modern Cobalt Blue Palette
        pitch: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f172a'
        },
        // Matchday Stadium Sky & Cyan Palette
        stadium: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        },
        // Modern Tactical Slate Palette
        tactical: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        // Golden Trophy / Competition Highlights
        trophy: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        // Primary brand mapped to Clean Cobalt Blue
        primary: { 
          50: '#eff6ff', 
          100: '#dbeafe', 
          200: '#bfdbfe', 
          300: '#93c5fd', 
          400: '#60a5fa', 
          500: '#3b82f6', 
          600: '#2563eb', 
          700: '#1d4ed8', 
          800: '#1e40af', 
          900: '#1e3a8a',
          950: '#172554'
        },
        secondary: { 
          50: '#f0f9ff', 
          100: '#e0f2fe', 
          200: '#bae6fd', 
          300: '#7dd3fc', 
          400: '#38bdf8', 
          500: '#0ea5e9', 
          600: '#0284c7', 
          700: '#0369a1', 
          800: '#075985', 
          900: '#0c4a6e' 
        },
        dark: { 
          50: '#f8fafc', 
          100: '#f1f5f9', 
          200: '#e2e8f0', 
          300: '#cbd5e1', 
          400: '#94a3b8', 
          500: '#64748b', 
          600: '#475569', 
          700: '#334155', 
          800: '#1e293b', 
          900: '#0f172a',
          950: '#090d16'
        }
      }
    }
  },
  plugins: []
};
