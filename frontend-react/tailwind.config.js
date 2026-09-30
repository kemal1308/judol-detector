/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#800000',
        secondary: '#2D2926',
        tertiary: '#D4AF37',
        neutral: '#F9F6F2',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
