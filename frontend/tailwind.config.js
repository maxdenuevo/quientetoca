/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        // Neobrutalist Christmas Color Palette
        colors: {
          christmas: {
            red: '#FF3B3B',      // Primary - Bold red for CTAs
            green: '#00D9A3',    // Secondary - Mint green for accents
            yellow: '#FFD93D',   // Accent - Bright yellow for highlights
            black: '#0A0A0A',    // Near black for text/borders
            white: '#FFFFFF',    // Pure white
          },
        },
        // Space Grotesk font family
        fontFamily: {
          sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        },
        // Hard offset shadows for neobrutalism
        boxShadow: {
          'brutal-sm': '2px 2px 0px #000000',
          'brutal': '4px 4px 0px #000000',
          'brutal-lg': '6px 6px 0px #000000',
          'brutal-xl': '8px 8px 0px #000000',
        },
        // Minimal border radius
        borderRadius: {
          'brutal': '4px',
          'brutal-lg': '6px',
        },
        // Border widths
        borderWidth: {
          'brutal': '3px',
        },
      },
    },
    darkMode: 'class',
    plugins: [],
  }