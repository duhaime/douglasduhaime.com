const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const paths = {
  src: path.resolve(__dirname, '_site', 'assets', 'index.js'),
  build: path.resolve(__dirname, '_site', 'assets'),
};

const uglifyConfig = {
  minimize: true,
  comments: false,
  sourceMap: false
};

module.exports = {
  entry: paths.src,
  output: {
    path: paths.build,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /(node_modules)/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(uglifyConfig),
    new ExtractTextPlugin('style.css'),
    new OptimizeCssAssetsPlugin()
  ]
};