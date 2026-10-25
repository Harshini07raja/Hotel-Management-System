/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aurevia Hotels & Resorts brand palette
        aurevia: {
          forest:  '#142820',   // Primary — deep forest green
          'forest-light': '#1e3d2f',
          'forest-dark':  '#0d1d15',
          gold:    '#E6D2A2',   // Accent — champagne gold
          'gold-dark':  '#c9b67f',
          'gold-light': '#f2e8cc',
          ivory:   '#F7F1E7',   // Background — warm ivory
          'ivory-dark': '#ede4d4',
          charcoal: '#1C1C1C',  // Text — dark charcoal
          muted:   '#6B7280',   // Muted text
          border:  '#E5DDD0',   // Card borders
        },
        // Keep legacy brand for any code that still uses it
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'aurevia-sm': '0 1px 3px 0 rgba(20, 40, 32, 0.08), 0 1px 2px -1px rgba(20, 40, 32, 0.06)',
        'aurevia':    '0 4px 6px -1px rgba(20, 40, 32, 0.1), 0 2px 4px -2px rgba(20, 40, 32, 0.06)',
        'aurevia-md': '0 10px 15px -3px rgba(20, 40, 32, 0.1), 0 4px 6px -4px rgba(20, 40, 32, 0.05)',
        'aurevia-lg': '0 20px 25px -5px rgba(20, 40, 32, 0.12), 0 8px 10px -6px rgba(20, 40, 32, 0.05)',
        'gold':       '0 4px 14px 0 rgba(230, 210, 162, 0.4)',
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(135deg, rgba(20,40,32,0.92) 0%, rgba(20,40,32,0.7) 60%, rgba(20,40,32,0.4) 100%)",
        'gold-shimmer': 'linear-gradient(135deg, #E6D2A2 0%, #c9b67f 50%, #E6D2A2 100%)',
        'forest-gradient': 'linear-gradient(135deg, #142820 0%, #1e3d2f 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
