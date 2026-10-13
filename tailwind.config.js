/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        massa: {
          lime: '#9CD01A',
          'lime-hover': '#ABDE24',
          'lime-light': '#BCE744',
          'lime-glow': 'rgba(156, 208, 26, 0.35)',
          carbon: '#171717',
          'carbon-surface': '#1F1F21',
          obsidian: '#0D0D0E',
          'obsidian-deep': '#070708',
          card: 'rgba(23, 23, 23, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(156, 208, 26, 0.35)',
          'border-active': 'rgba(156, 208, 26, 0.65)',
          text: '#F5F5F5',
          muted: '#A3A3A3',
          subtle: '#737373',
        },
        overlay: 'rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass': '0 20px 50px rgba(0, 0, 0, 0.6)',
        'glass-hover': '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 25px rgba(156, 208, 26, 0.15)',
        'lime-glow': '0 0 25px rgba(156, 208, 26, 0.45)',
        'lime-glow-lg': '0 0 40px rgba(156, 208, 26, 0.6)',
      },
    },
  },
  plugins: [],
}

