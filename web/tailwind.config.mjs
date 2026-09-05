/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        // 本文の可読性を優先した和文明朝（長文の連載を読ませるための書体）
        serif: ['"Noto Serif JP"', 'serif'],
        display: ['"Zen Maru Gothic"', '"Yu Gothic"', 'sans-serif'],
        eyebrow: ['Arial', 'sans-serif'],
      },
      colors: {
        paper: {
          50: '#fffaf3',
          100: '#fff0f5',
          200: '#f5d7e2',
          300: '#e7bbcd',
        },
        // 本文のインク（長文を読ませるための高コントラストな墨色）
        ink: {
          900: '#382e34',
          800: '#44373e',
          700: '#55434c',
          600: '#705963',
          500: '#826976',
        },
        tide: {
          300: '#b3e3d5',
          400: '#73bca8',
          500: '#287f79',
          600: '#246e68',
          700: '#22645f',
          900: '#304b48',
        },
        sage: {
          400: '#a8d7bf',
          500: '#5a9c80',
          600: '#387659',
        },
        gilt: {
          300: '#fff0b6',
          400: '#edbf68',
          500: '#b68b30',
          600: '#886621',
        },
        seal: {
          400: '#bd3466',
          500: '#ce3f72',
          600: '#a12d59',
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
            h1: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.tide.900') },
            h2: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.tide.900') },
            h3: { fontFamily: theme('fontFamily.display').join(','), color: theme('colors.tide.900') },
            strong: { color: theme('colors.ink.900') },
            a: { color: theme('colors.tide.600') },
            blockquote: {
              borderLeftColor: theme('colors.gilt.400'),
              color: theme('colors.ink.700'),
            },
            hr: { borderColor: theme('colors.paper.300') },
            img: {
              borderRadius: '0.25rem',
              boxShadow: '0 25px 50px -20px rgba(13, 51, 53, 0.25)',
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
