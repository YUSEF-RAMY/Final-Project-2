/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'pulse-custom': {
          '0%, 100%': { transform: 'scale(1)', backgroundColor: '#ddd' },
          '50%': { transform: 'scale(1.3)', backgroundColor: '#2ecc71' },
        },
      },
      animation: {
        'pulse-custom': 'pulse-custom 1.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}