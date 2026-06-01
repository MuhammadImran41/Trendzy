/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff0f6',
          100: '#ffd6e8',
          200: '#ffadd0',
          300: '#ff85b8',
          400: '#ff5c9f',
          500: '#e8347a',
          600: '#c4175e',
          700: '#9e0d49',
          800: '#780637',
          900: '#520226',
        },
        dark: {
          900: '#0d0d0d',
          800: '#161616',
          700: '#1f1f1f',
          600: '#2a2a2a',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};
