/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Bu satır çok önemli
  ],
  theme: {
    extend: {
      // Senin özel renklerin
      colors: {
        deepBlack: '#090909',
        darkPurple: '#2D1B4E',
        neonPurple: '#6D28D9',
      },
    },
  },
  plugins: [],
}