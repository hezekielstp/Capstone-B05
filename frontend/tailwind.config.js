/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  extend: {
    scrollbar: ['rounded'],
  },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
