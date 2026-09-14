/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0a0d16',
          800: '#0e1220',
          700: '#151a2e',
        },
        accent: {
          DEFAULT: '#7c3aed',
          soft: '#a78bfa',
        },
        cyan: {
          glow: '#22d3ee',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(124,58,237,0.55)',
        'glow-cyan': '0 0 40px -12px rgba(34,211,238,0.55)',
        glass: '0 8px 32px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        pulseglow: {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        pulseglow: 'pulseglow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
