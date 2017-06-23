var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var time = Date.now(),
    jsOut = 'page.bundle.js?id=' + time,
    cssOut = 'page.style.css?id=' + time;

module.exports = {
  entry: './utils/webpack/index.js',
  output: {
    filename: jsOut,
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      minimize: true,
      comments: false,
      sourceMap: false
    }),
    new OptimizeCssAssetsPlugin(),
    new ExtractTextPlugin(cssOut)
  ]
};