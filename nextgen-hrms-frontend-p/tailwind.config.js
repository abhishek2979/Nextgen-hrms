/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#0F2027',
          800: '#1B3344',
          700: '#27475C',
        },
        sand: {
          50: '#FBF8F3',
          100: '#F4EFE6',
          200: '#E8E0D2',
        },
        moss: {
          500: '#4F7E6B',
          600: '#3F6657',
        },
        amber: {
          400: '#E2A340',
          500: '#D6912B',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(15,32,39,0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
