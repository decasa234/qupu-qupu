/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        'qupu-orange': '#F97316',
        'qupu-orange-dark': '#EA580C',
        'qupu-orange-light': '#FDBA74',
        'qupu-purple': '#7C3AED',
        'qupu-purple-dark': '#5B21B6',
        'qupu-blue': '#2563EB',
        'qupu-blue-dark': '#1E3A8A',
        'qupu-blue-light': '#60A5FA',
        'qupu-brand-blue': '#30598A',
        'qupu-brand-blue-shadow': '#263B55',
        'qupu-brand-orange': '#f0853a',
        'qupu-brand-yellow': '#ffdd55',
        'qupu-sky': '#DBEAFE',
        'qupu-shell': '#FFF9F4',
        'qupu-cream': '#FFF2DF',
        'qupu-peach': '#FFD3B1',
        'qupu-ink': '#1E3A8A',
        'qupu-muted': '#475569',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['"Baloo 2"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 40px rgba(30, 58, 138, 0.12)',
        card: '0 14px 28px rgba(249, 115, 22, 0.25)',
        clay: '0 10px 0 0 rgba(30, 58, 138, 0.15), 0 20px 40px rgba(30, 58, 138, 0.1)',
        'clay-orange': '0 8px 0 0 rgba(234, 88, 12, 0.35), 0 16px 32px rgba(249, 115, 22, 0.3)',
        subscribe: '0 3px 0 0 #263B55',
      },
      backgroundImage: {
        'hero-sun': 'radial-gradient(ellipse at top, #FED7AA 0%, #FFEDD5 45%, #FFF7ED 100%)',
        'cloud-stripes': 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)',
      },
      keyframes: {
        ring: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(22deg)' },
          '20%': { transform: 'rotate(-18deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(6deg)' },
          '60%': { transform: 'rotate(-4deg)' },
          '70%': { transform: 'rotate(2deg)' },
          '80%': { transform: 'rotate(-1deg)' },
        },
        rise: {
          from: { transform: 'translateY(9px)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        ring: 'ring 0.9s ease-in-out',
        rise: 'rise 0.35s cubic-bezier(.34,1.4,.5,1) both',
      },
    },
  },
  plugins: [],
}
