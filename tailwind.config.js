/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jakarta: '#3F2A52',
        'dark-blue-gray': '#75619D',
        wisteria: '#BEAEDB',
        'bright-gray': '#E6EFF7',
        'black-coffee': '#3A2D34',
      },
    },
  },
  plugins: [],
}
