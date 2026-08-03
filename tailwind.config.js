/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4361ee',
          dark: '#3a56d4',
        },
        dark: '#1d3557',
        success: '#2ec4b6',
        danger: '#e63946',
        warning: '#f4a261',
        info: '#457b9d',
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,0.08)',
        cardLg: '0 5px 25px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
