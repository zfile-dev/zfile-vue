module.exports = {
  // important: true,
  mode: 'jit',
  content: [
      './index.html',
      './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    // textColor: {
    //   'danger': '#ffed4a',
    //   'error': '#e3342f',
    //   'tips': '#aaaaaa',
    // },
    extend: {
      colors: {
        'info': '#2d8cf0'
      },
      backgroundColor: {
        'blue-info': '#2d8cf0'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
}