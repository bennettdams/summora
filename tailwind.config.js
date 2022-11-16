// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require('tailwindcss/defaultTheme')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gray: colors.stone,
        dlight: '#fcf8f7',
        dlila: '#993a58',
        dorange: '#e08560',
        dbrown: '#d4ad9f',
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
}
