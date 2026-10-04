/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    blur: false,
    backdropBlur: false,
    backdropFilter: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f172a',
        },
        surface: {
          light: '#ffffff',
          'light-subtle': '#f8fafc',
          'light-border': '#e2e8f0',
          dark: '#1e293b',
          'dark-subtle': '#0f172a',
          'dark-border': '#334155',
        }
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      }
    },
  },
  plugins: [],
}
