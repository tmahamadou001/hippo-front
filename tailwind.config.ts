import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'poppins': ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // Fonts alternatives gardées pour les démos
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'outfit': ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0f6fa',
          100: '#dde8f0',
          200: '#b8d0e0',
          300: '#8fb5cf',
          400: '#5f94bb',
          500: '#3474a6',
          600: '#0A2540',
          700: '#081e35',
          800: '#06172a',
          900: '#04101f',
        },
        secondary: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        corail: {
          50:  '#fff5f5',
          100: '#ffe1e1',
          200: '#ffc1c1',
          300: '#ffa0a0',
          400: '#fc8282',
          500: '#FF6B4A',
          600: '#e25e5e',
          700: '#ba4d4d',
          800: '#933c3c',
          900: '#6b2c2c',
        }
      }
    }
  },
  plugins: [],
} satisfies Config
