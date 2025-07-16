/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cyber-teal': '#00B7B8',
        'neon-magenta': '#FF0080',
        'crisp-black': '#0A0A0A',
        'muted-graphite': '#2D2D2D',
        'electric-blue': '#00D4FF',
        'light-graphite': '#4A4A4A',
        'soft-white': '#F5F5F5'
      },
      fontFamily: {
        'cyber': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 183, 184, 0.3)',
        'neon': '0 0 15px rgba(255, 0, 128, 0.4)',
        'electric': '0 0 25px rgba(0, 212, 255, 0.3)',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #00B7B8 0%, #FF0080 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #2D2D2D 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 183, 184, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 183, 184, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};