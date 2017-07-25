var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  entry: './_site/assets/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '_site', 'assets')
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
    new ExtractTextPlugin('style.css'),
    new OptimizeCssAssetsPlugin()
  ]
};