/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B302E',     // CareHaven dark teal
          darker: '#082523',   // Darker shade for contrast
          light: '#F8F9FA',    // Light background
          accent: '#E0FF4F',   // Lime yellow
        },
        dark: {
          900: '#020617', // Deep navy
          800: '#0f172a',
          700: '#1e293b',
        },
        primary: {
          400: '#60a5fa',
          500: '#3b82f6', // Electric blue
          600: '#2563eb',
        },
        accent: {
          green: '#10b981', // Emerald green
          pink: '#ec4899', // Soft pink
          purple: '#a855f7',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #3b82f6, #10b981)', // Blue to Green
        'gradient-secondary': 'linear-gradient(to right, #a855f7, #ec4899)', // Purple to Pink
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        slideDown: {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        slideDown: 'slideDown 0.2s ease-out forwards',
      }
    },
  },
  plugins: [],
}

