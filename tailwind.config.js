// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require('tailwindcss/defaultTheme')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors')

// COLOR THEMES
// ----- Brown
// gray: colors.stone,
// dlight: '#fcf8f7',
// dprimary: '#993a58',
// dsecondary: '#e08560',
// dtertiary: '#d4ad9f',

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--global-summora-font)', ...defaultTheme.fontFamily.sans],
        serif: [
          'var(--global-summora-font-serif)',
          ...defaultTheme.fontFamily.serif,
        ],
      },
      colors: {
        gray: colors.slate,
        dprimary: '#993a58',
        dsecondary: '#4151a3',
        dtertiary: '#a0afda',
        dlight: '#eff2f8',
      },
      animation: {
        'fade-in': 'fade-in 300ms ease',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
    fontWeight: {
      normal: 400,
      semibold: 600,
      extrabold: 800,
    },
  },
  plugins: [require('@tailwindcss/forms')],
  future: {
    /**
     * Fixes "sticky hover" for touch devices. We e.g. had this problem in the "category selection"
     * at the search page where the buttons then just kept their "selected" style.
     * See: https://github.com/tailwindlabs/tailwindcss/pull/8394
     */
    hoverOnlyWhenSupported: true,
  },
}
