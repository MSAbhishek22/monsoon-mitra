/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        amber: {
          50:  '#FFF8E1',
          500: '#FF8F00',
          600: '#FFB300',
          700: '#E65100',
        },
        danger: {
          50:  '#FFEBEE',
          500: '#EF5350',
          700: '#C62828',
        },
        sky: {
          50:  '#E1F5FE',
          500: '#0277BD',
          600: '#29B6F6',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', "'Noto Sans Devanagari'", 'sans-serif']
      },
      animation: {
        'fade-in':     'fadeIn 300ms ease forwards',
        'slide-up':    'slideUp 300ms ease forwards',
        'slide-down':  'slideDown 300ms ease forwards',
        'slide-in-right': 'slideInRight 300ms ease forwards',
        'slide-in-left':  'slideInLeft 300ms ease forwards',
        'scale-in':    'scaleIn 300ms cubic-bezier(0.34,1.56,0.64,1) forwards',
        'spin':        'spin 1s linear infinite',
        'pulse':       'pulse 1.5s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'wave':        'waveFloat 3s ease-in-out infinite',
        'ripple':      'ripple 600ms ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(32px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-32px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        waveFloat: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-6px) rotate(1deg)' },
          '66%': { transform: 'translateY(3px) rotate(-1deg)' }
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
      },
      boxShadow: {
        'card':       '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12)',
        'btn':        '0 4px 12px rgba(46,125,50,0.3)',
        'alert':      '0 4px 16px rgba(198,40,40,0.2)',
        'nav':        '0 -2px 12px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    }
  },
  plugins: []
}