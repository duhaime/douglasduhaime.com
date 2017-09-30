const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const paths = {
  src: path.resolve(__dirname, '_site', 'assets'),
  build: path.resolve(__dirname, '_site'),
};

const uglifyConfig = {
  minimize: true,
  comments: false,
  sourceMap: false
};

const htmlConfig = {
  template: './_site/index.html',
  minify: {
    collapseWhitespace: true,
  },
}

module.exports = {
  entry: path.resolve(__dirname, paths.src, 'index.js'),
  output: {
    path: paths.build,
    filename: 'bundle.[chunkhash].js'
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
    new webpack.optimize.UglifyJsPlugin(uglifyConfig),
    new HtmlWebpackPlugin(htmlConfig),
    new ExtractTextPlugin('style.[contenthash].css'),
    new OptimizeCssAssetsPlugin()
  ]
};