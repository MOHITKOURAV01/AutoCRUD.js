/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        terminal: {
          DEFAULT: "#00ff88",
          green: "#00ff88",
          cyan: "#00d4ff",
          red: "#ff4757",
          yellow: "#ffa502",
          gray: "#1e1e1e",
          "dark-gray": "#121212",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
        'scanlines': "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)",
      },
      animation: {
        'text-glow': 'text-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'text-glow': {
          'from': { textShadow: '0 0 5px #00ff88, 0 0 10px #00ff88' },
          'to': { textShadow: '0 0 15px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88' },
        }
      }
    },
  },
  plugins: [],
}
