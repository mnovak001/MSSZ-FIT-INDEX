import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      minHeight: {
        '32': '8rem',
        '20': '5rem'
      }
    }
  },
  plugins: []
};
export default config;
