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
      spacing: {
        '26': '6.5rem',
      },
      colors: {
        'info': '#2d8cf0'
      },
      backgroundColor: {
        'blue-info': '#2d8cf0'
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px'
    }
  },
  variants: {
    extend: {},
  }
}
