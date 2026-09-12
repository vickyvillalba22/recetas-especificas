/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Fraunces', 'serif'] },
      colors: {
        ink: '#17251f',
        'ink-soft': '#1f302a',
        'ink-dark': '#0d1614',
        moss: '#335c48',
        sage: '#e4eee6',
        cream: '#f7f7f2',
        'cream-dark': '#f1ede2',
        coral: '#ee765c',
        sun: '#f4c95d',
      },
      boxShadow: { soft: '0 18px 50px rgba(23, 37, 31, 0.08)', 'soft-dark': '0 18px 50px rgba(0, 0, 0, 0.35)' },
    },
  },
  plugins: [],
}
