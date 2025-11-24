/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        // Cálido Invernal - Design System v1.1
        colors: {
          // Brand colors
          brand: {
            terracota: '#C4704A',
            'terracota-dark': '#A85D3B',
            'terracota-light': '#D4896A',
            arena: '#E8DFD0',
            carbon: '#2D2D2D',
            marfil: '#FAF7F2',
          },
          // Semantic colors
          accent: {
            oliva: '#7D8471',
            'oliva-light': '#9AAB8C',
            arcilla: '#B8860B',
            'arcilla-light': '#D4A82E',
            burdeos: '#722F37',
            'burdeos-light': '#A34450',
            piedra: '#8B8680',
          },
          // Dark mode specific
          dark: {
            bg: '#1A1A1A',
            surface: '#2A2A2A',
            'surface-hover': '#333333',
            border: '#404040',
            'text-primary': '#F5F5F5',
            'text-secondary': '#A0A0A0',
          },
          // Legacy aliases (para migración gradual)
          christmas: {
            red: '#C4704A',      // → terracota
            green: '#7D8471',    // → oliva
            yellow: '#B8860B',   // → arcilla
            black: '#2D2D2D',    // → carbon
            white: '#FAF7F2',    // → marfil
          },
        },
        // DM Sans font family (más cálida)
        fontFamily: {
          sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        },
        // Soft UI shadows
        boxShadow: {
          'soft-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          'soft': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
          'soft-md': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
          'soft-lg': '0 8px 24px 0 rgb(0 0 0 / 0.12)',
          // Legacy (para migración)
          'brutal-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          'brutal': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
          'brutal-lg': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
          'brutal-xl': '0 8px 24px 0 rgb(0 0 0 / 0.12)',
        },
        // Soft border radius
        borderRadius: {
          'soft': '8px',
          'soft-lg': '12px',
          'soft-xl': '16px',
          // Legacy (para migración)
          'brutal': '8px',
          'brutal-lg': '12px',
        },
        // Border widths
        borderWidth: {
          'brutal': '1px', // Cambiado de 3px a 1px
        },
      },
    },
    darkMode: 'class',
    plugins: [],
  }
