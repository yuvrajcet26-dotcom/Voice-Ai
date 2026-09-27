/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        svkm: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcff',
          300: '#9ec4ff',
          400: '#6ea3ff',
          500: '#3b82f6',
          600: '#1d4ed8',
          700: '#1e3a8a', // SVKM Primary Deep Navy
          800: '#172554',
          900: '#0f172a',
          gold: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
