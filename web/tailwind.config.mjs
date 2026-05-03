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
        // 和紙〜墨のスケール（50=最も白い、900=最も濃い墨）
        ink: {
          50: '#fcfaf3',
          100: '#f5efe1',
          200: '#e8dec5',
          300: '#c9b994',
          400: '#9d8a66',
          500: '#6e5e44',
          600: '#4d3f2c',
          700: '#352a1c',
          800: '#231a10',
          900: '#15100a',
        },
        plum: {
          300: '#b88aa8',
          400: '#90647f',
          500: '#6a4458',
          600: '#4a2d3c',
        },
        // 古代朱 ／ アクセントに使う
        vermilion: {
          400: '#c25b4f',
          500: '#a8413a',
          600: '#86322d',
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.ink.800'),
            maxWidth: 'none',
            lineHeight: '2.0',
            fontFamily: theme('fontFamily.serif').join(','),
            'p, li': {
              letterSpacing: '0.04em',
              fontFeatureSettings: '"palt"',
            },
            h1: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.ink.900') },
            h2: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.ink.900') },
            h3: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.ink.900') },
            strong: { color: theme('colors.ink.900') },
            a: { color: theme('colors.plum.500') },
            blockquote: {
              borderLeftColor: theme('colors.ink.300'),
              color: theme('colors.ink.700'),
            },
            hr: { borderColor: theme('colors.ink.200') },
            'img': {
              borderRadius: '0.25rem',
              boxShadow: '0 25px 50px -20px rgba(53, 42, 28, 0.25)',
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
