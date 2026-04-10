/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:     '#080808',
        surface:  '#111111',
        elevated: '#1A1A1A',
        overlay:  '#222222',
        border: {
          subtle:  '#1C1C1C',
          default: '#2A2A2A',
          strong:  '#3D3D3D',
        },
        safe:     { DEFAULT: '#22C55E', bg: 'rgba(22,163,74,0.10)', border: 'rgba(34,197,94,0.25)' },
        moderate: { DEFAULT: '#FACC15', bg: 'rgba(202,138,4,0.10)',  border: 'rgba(234,179,8,0.25)' },
        caution:  { DEFAULT: '#F87171', bg: 'rgba(220,38,38,0.10)',  border: 'rgba(239,68,68,0.25)' },
        accent:   '#6366F1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite linear',
        pop:     'pop 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill:    'fill 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scan:    'scan 1.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition:  '400px 0' },
        },
        pop: {
          from: { transform: 'scale(0)', opacity: '0' },
          to:   { transform: 'scale(1)', opacity: '1' },
        },
        fill: {
          to: { transform: 'scaleX(1)' },
        },
        scan: {
          '0%':   { top: '0%',   opacity: '1' },
          '45%':  { top: '100%', opacity: '1' },
          '50%':  { top: '100%', opacity: '0' },
          '55%':  { top: '0%',   opacity: '0' },
          '60%':  { top: '0%',   opacity: '1' },
          '100%': { top: '100%', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
