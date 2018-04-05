var path = require('path')

var conf = {

  mode: process.env.NODE_ENV === 'development'
    ? 'development'
    : 'production', // default to prod

  entry: './src/index.js',

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'app')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ]
      },
      {
        test: /\.(png|jpg|gif|otf|eot|svg|ttf|woff|woff2)(\?.*)?$/i,
        use: [
          {loader: 'url-loader'}
        ]
      }
    ]
  },
  performance: {
    hints: false
  }
}

module.exports = conf
