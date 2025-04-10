/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066A1',
          600: '#007DB8',
          400: '#0099D8',
        },
      },
    },
  },
  plugins: [],
  darkMode: ['selector', '.dark'],
};
