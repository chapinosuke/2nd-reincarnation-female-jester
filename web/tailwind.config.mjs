/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        // 本文の可読性を優先した和文明朝（長文の連載を読ませるための書体）
        serif: ['"Noto Serif JP"', 'serif'],
        // 見出し・扉に使う和文明朝（フリーレン公式サイト踏襲）
        display: ['"Zen Old Mincho"', '"Noto Serif JP"', 'serif'],
        // 英字キャップスのアイキャッチ（フリーレン公式サイト踏襲）
        eyebrow: ['"Cinzel"', 'serif'],
      },
      colors: {
        // 紙面：白磁に近い生成り（フリーレン公式の白地＋粒状のノイズを踏襲）
        paper: {
          50: '#fbfaf4',
          100: '#f5f1e6',
          200: '#ece5d1',
          300: '#ddd3b4',
        },
        // 本文のインク（長文を読ませるための高コントラストな墨色）
        ink: {
          900: '#20211d',
          800: '#2c2d27',
          700: '#454640',
          600: '#5c5d54',
          500: '#78786d',
        },
        // 湖水・魔法の青緑（フリーレン公式サイトの --color-blue #01adaf 系）
        tide: {
          300: '#5fc9c9',
          400: '#2bacac',
          500: '#0f8c8d',
          600: '#0b6f71',
          700: '#0a5a5c',
          900: '#0d3335',
        },
        // 森の緑（フリーレン公式サイトの --color-green #04aa72 系）
        sage: {
          400: '#4bb389',
          500: '#238c68',
          600: '#1b6f53',
        },
        // 古い金細工・巻物の金（フリーレン公式サイトの --color-gold #dccd85 系）
        gilt: {
          300: '#e8dcae',
          400: '#cbaa5c',
          500: '#ab8a3e',
          600: '#8a6d2c',
        },
        // 朱印（唯一の暖色差し色。判子にのみ使う）
        seal: {
          400: '#c14b38',
          500: '#a83c2b',
          600: '#8a301f',
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
