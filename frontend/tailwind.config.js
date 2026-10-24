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
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal primary
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        electric: {
          light: '#fef08a',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
        },
        water: {
          light: '#bae6fd',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
        }
      },
      fontFamily: {
        sans: [
          'Noto Sans',
          'Noto Sans Telugu',
          'Noto Sans Devanagari',
          'Noto Sans Tamil',
          'Noto Sans Kannada',
          'Noto Sans Malayalam',
          'Noto Sans Bengali',
          'Noto Sans Gujarati',
          'Noto Sans Gurmukhi',
          'Noto Sans Oriya',
          'Noto Sans Arabic',
          'system-ui',
          'sans-serif'
        ],
      }
    },
  },
  plugins: [],
}
