module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    maxWidth: {
      '3/7': '42.8%'
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
