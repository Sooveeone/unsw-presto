/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryBlue: '#3378B1',
        lightBlue: '#BCE5F6',
        platinumLight: '#F0F6F7',
        platinum: '#FCFCFC',
        lightGray: '#E2E5EC',
        platinumGray: '#CAD6DB',
      },
      flex: {
        '2/3': '2 2 66.666%', 
        '1/3': '1 1 33.333%', 
      },
    },
  },
  plugins: [],
}

