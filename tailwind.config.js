/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Fraunces', 'serif'] },
      colors: { ink: '#17251f', moss: '#335c48', sage: '#e4eee6', cream: '#f7f7f2', coral: '#ee765c', sun: '#f4c95d' },
      boxShadow: { soft: '0 18px 50px rgba(23, 37, 31, 0.08)' },
    },
  },
  plugins: [],
}
