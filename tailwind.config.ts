import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pitch: '#060d1a',
        'pitch-light': '#0d1a2e',
        danger: '#E10600',
        'danger-dark': '#b30500',
        silver: '#A8B4C0',
        gold: '#FFD700',
        'gold-dark': '#C8A600',
      },
      backgroundImage: {
        'stadium-glow':
          'linear-gradient(160deg, #060d1a 0%, #0d1a2e 55%, #1a0d2e 100%)',
        'hero-gradient':
          'linear-gradient(135deg, #060d1a 0%, #160308 50%, #060d1a 100%)',
        'card-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(225,6,0,0.3)',
        'glow-sm': '0 0 10px rgba(225,6,0,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
