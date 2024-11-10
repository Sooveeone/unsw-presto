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
    },
  },
  plugins: [],
}

