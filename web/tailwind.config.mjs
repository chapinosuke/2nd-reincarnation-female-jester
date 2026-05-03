/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['"Noto Sans JP"', 'sans-serif'],
        display: ['"Shippori Mincho B1"', '"Noto Serif JP"', 'serif'],
      },
      colors: {
        ink: {
          50: '#f5f3ee',
          100: '#e8e2d3',
          200: '#c8bfa8',
          300: '#9a8e75',
          400: '#6a5f4d',
          500: '#3a3327',
          600: '#262017',
          700: '#1a1610',
          800: '#13100b',
          900: '#0c0a07',
        },
        plum: {
          400: '#a07a96',
          500: '#7a5470',
          600: '#553848',
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.ink.100'),
            maxWidth: 'none',
            lineHeight: '2.0',
            fontFamily: theme('fontFamily.serif').join(','),
            'p, li': {
              letterSpacing: '0.04em',
              fontFeatureSettings: '"palt"',
            },
            h1: { fontFamily: theme('fontFamily.display').join(',') },
            h2: { fontFamily: theme('fontFamily.display').join(',') },
            h3: { fontFamily: theme('fontFamily.display').join(',') },
            'img': {
              borderRadius: '0.25rem',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
              marginTop: '2.5em',
              marginBottom: '2.5em',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
