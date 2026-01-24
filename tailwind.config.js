/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B46C1', // Deep Purple
          light: '#A78BFA', // Soft Purple
          dark: '#553C9A',
        },
        secondary: {
          DEFAULT: '#F97316', // Vibrant Orange
          light: '#FED7AA', // Light Orange
          dark: '#EA580C',
        },
        background: {
          light: '#F3F4F6',
          dark: '#1F2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      }
    },
  },
  plugins: [],
};
