/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066A1',
          foreground: '#FFFFFF',
          600: '#007DB8',
          400: '#0099D8',
        },
        destructive: {
          DEFAULT: '#FF0000',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#f8fafc', // Changed from #FFFFFF to softer slate-50
          foreground: '#000000',
        },
        input: {
          DEFAULT: '#e2e8f0', // slate-200
        },
        background: {
          DEFAULT: '#f8fafc', // slate-50
        },
        foreground: {
          DEFAULT: '#0f172a', // slate-900
        },
        muted: {
          DEFAULT: '#f1f5f9', // slate-100
          foreground: '#64748b', // slate-500
        },
        accent: {
          DEFAULT: '#f1f5f9', // slate-100
          foreground: '#0f172a', // slate-900
        },
        secondary: {
          DEFAULT: '#f1f5f9', // slate-100
          foreground: '#0f172a', // slate-900
        },
      },
      animation: {
        spin: 'spin 0.8s linear infinite',
      },
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: ['selector', '.dark'],
};
