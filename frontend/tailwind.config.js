/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bank: {
          dark: '#0a0f24',
          card: 'rgba(15, 23, 42, 0.45)', // glassmorphism dark
          royal: '#1e40af',
          lightRoyal: '#3b82f6',
          silver: '#e2e8f0',
          accent: '#06b6d4', // neon blue/teal
          emerald: '#10b981',
          rose: '#f43f5e',
          gold: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace']
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
