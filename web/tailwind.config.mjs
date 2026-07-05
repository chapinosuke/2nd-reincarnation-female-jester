/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        display: ['"Kaisei Decol"', '"Noto Serif JP"', 'serif'],
        pixel: ['"DotGothic16"', '"Noto Sans JP"', 'sans-serif'],
      },
      colors: {
        // 夜の酒場：胡桃材の褐色（サイト全体の基調）
        wood: {
          950: '#1d130c',
          900: '#241811',
          800: '#2f2016',
          700: '#3d2b1d',
          600: '#4f3a26',
          500: '#6b5138',
          400: '#8a6c4b',
          300: '#a8896a',
        },
        // ギルドの書類：羊皮紙（読みの紙面）
        parchment: {
          50: '#f9f1dd',
          100: '#f3e8cc',
          200: '#eadbb6',
          300: '#dcc999',
          400: '#c4ad79',
        },
        // 羊皮紙の上のインク
        ink: {
          900: '#241808',
          800: '#322512',
          700: '#4a3a20',
          600: '#63512f',
          500: '#7d6a44',
        },
        // 蝋燭の灯り
        candle: {
          300: '#f2c073',
          400: '#e6a54e',
          500: '#d38a2f',
          600: '#b06f1f',
        },
        // 朱肉（判子・アクセント）
        shu: {
          400: '#cf4a36',
          500: '#b93a28',
          600: '#98301f',
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.ink.800'),
            maxWidth: 'none',
            lineHeight: '2.05',
            fontFamily: theme('fontFamily.serif').join(','),
            'p, li': {
              letterSpacing: '0.04em',
              fontFeatureSettings: '"palt"',
            },
            h1: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.ink.900') },
            h2: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.ink.900') },
            h3: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.ink.900') },
            strong: { color: theme('colors.ink.900') },
            a: { color: theme('colors.shu.600') },
            blockquote: {
              borderLeftColor: theme('colors.parchment.400'),
              color: theme('colors.ink.700'),
            },
            hr: { borderColor: theme('colors.parchment.300') },
            img: {
              borderRadius: '0.25rem',
              boxShadow: '0 25px 50px -20px rgba(36, 24, 8, 0.35)',
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
