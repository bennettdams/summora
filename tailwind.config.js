// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require('tailwindcss/defaultTheme')
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const colors = require('tailwindcss/colors')

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
        dlight: '#fff6f0',
        dlila: '#96284b',
        dorange: '#d1744f',
        dbrown: '#d4ad9f',
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
