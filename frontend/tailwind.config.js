/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // CinePick Brand Colors
        brand: {
          red: '#E50914',
          'red-dark': '#B20710',
          'red-light': '#FF1A24',
          gold: '#F5C518',
          'gold-dark': '#D4A017'
        },
        surface: {
          DEFAULT: '#141414',
          '50': '#1f1f1f',
          '100': '#2a2a2a',
          '200': '#363636',
          '300': '#424242'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to bottom, transparent 0%, rgba(20,20,20,0.6) 50%, #141414 100%)',
        'card-gradient': 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(229,9,20,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(229,9,20,0.6)' }
        }
      },
      screens: {
        xs: '480px'
      }
    }
  },
  plugins: []
};
