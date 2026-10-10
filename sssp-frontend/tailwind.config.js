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
        // Football Brand Green Palette
        pitch: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#064e3b',
          900: '#0b2924',
          950: '#061a17'
        },
        // Matchday Stadium Night Palette
        stadium: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#0b2638',
          900: '#071426',
          950: '#040b15'
        },
        // Tactical Board Slate Palette
        tactical: {
          50: '#f4fbf7',
          100: '#e5f7ed',
          200: '#cbeedb',
          300: '#a2dfc1',
          400: '#6ec8a0',
          500: '#42ad7f',
          600: '#2f8d64',
          700: '#257051',
          800: '#1e5942',
          900: '#12291d',
          950: '#07120e'
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
        // Backward-compatible primary/secondary/dark mapped to football theme
        primary: { 
          50: '#ecfdf5', 
          100: '#d1fae5', 
          200: '#a7f3d0', 
          300: '#6ee7b7', 
          400: '#34d399', 
          500: '#10b981', 
          600: '#059669', 
          700: '#047857', 
          800: '#064e3b', 
          900: '#0b2924' 
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
          800: '#0b1e2d', 
          900: '#06131b',
          950: '#030b10'
        }
      }
    }
  },
  plugins: []
};
