var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: [
    './client/app.js'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  devServer: {
    historyApiFallback: true,
    proxy: [{
      path: '/api/*',
      target: 'http://localhost:3001'
    }]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        loaders: ['babel'],
        include: path.join(__dirname, 'app')
      },
      {
        test: /\.css/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
}
