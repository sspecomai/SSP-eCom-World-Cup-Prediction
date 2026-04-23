import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: '#081226',
        danger: '#E10600',
        silver: '#B9C0CC'
      },
      backgroundImage: {
        'stadium-glow': 'linear-gradient(160deg, #081226 0%, #111827 55%, #E10600 120%)'
      }
    }
  },
  plugins: []
};

export default config;
