/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        medical: {
          blue: '#2B5296',
          slate: '#F8FAFC',
          border: '#E2E8F0'
        }
      }
    },
  },
  plugins: [],
}