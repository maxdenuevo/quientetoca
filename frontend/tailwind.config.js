/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Neon Editorial Design System
      colors: {
        // Base colors (dark-only)
        neon: {
          base: '#0A0A0A',
          surface: '#1A1A1A',
          elevated: '#252525',
          border: '#333333',
        },
        // Text colors
        text: {
          primary: '#FFFFFF',
          secondary: '#888888',
          muted: '#666666',
        },
        // Accent colors (neon saturated)
        accent: {
          blurple: '#7B5CFF',
          pernod: '#C8FF00',
          hotbrick: '#FF4444',
          cyber: '#00FFFF',
          magenta: '#FF00FF',
        },
      },
      // Font families
      fontFamily: {
        display: ['Oswald', 'Impact', 'sans-serif'],
        headline: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Glow shadows
      boxShadow: {
        'glow-blurple': '0 0 20px rgba(123, 92, 255, 0.5)',
        'glow-blurple-lg': '0 0 40px rgba(123, 92, 255, 0.6)',
        'glow-pernod': '0 0 20px rgba(200, 255, 0, 0.5)',
        'glow-pernod-lg': '0 0 40px rgba(200, 255, 0, 0.6)',
        'glow-hotbrick': '0 0 20px rgba(255, 68, 68, 0.5)',
        'glow-hotbrick-lg': '0 0 40px rgba(255, 68, 68, 0.6)',
        'glow-cyber': '0 0 20px rgba(0, 255, 255, 0.5)',
        'glow-cyber-lg': '0 0 40px rgba(0, 255, 255, 0.6)',
        'glow-magenta': '0 0 20px rgba(255, 0, 255, 0.5)',
        'glow-magenta-lg': '0 0 40px rgba(255, 0, 255, 0.6)',
      },
      // Sharp border radius (brutalist)
      borderRadius: {
        'none': '0',
        'sm': '0',
        'DEFAULT': '0',
        'md': '0',
        'lg': '0',
        'xl': '0',
        '2xl': '0',
        '3xl': '0',
        'full': '9999px',
      },
      // Animations
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      // Typography scale
      fontSize: {
        'display': ['clamp(3rem, 10vw, 5rem)', { lineHeight: '0.9', letterSpacing: '0.02em' }],
        'display-lg': ['clamp(4rem, 15vw, 8rem)', { lineHeight: '0.85', letterSpacing: '0.02em' }],
      },
    },
  },
  plugins: [],
}
