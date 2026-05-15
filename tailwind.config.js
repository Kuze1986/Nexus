/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#080C14',
          surface: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.10)',
          accent: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
};
