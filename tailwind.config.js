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
        dlight: '#faf2f0',
        dlila: '#993a58',
        dorange: '#e08560',
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
