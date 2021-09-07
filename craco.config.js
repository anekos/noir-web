const Dotenv = require('dotenv-webpack')

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    plugins: {
      add: [
        new Dotenv({path: './config/' + process.env.NODE_ENV})
      ],
    },
  },
}
