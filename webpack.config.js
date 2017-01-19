const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');


module.exports = {
  entry: {
    bundle: ['babel-polyfill', './frontend/react/main'],
    // landing: './frontend/react/landing/main'
  },
  output: {
    path: path.join(__dirname, 'main/static/js'),
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: '/static/',
  },
  watch: true,
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          plugins: ['transform-decorators-legacy' ],
          presets: ['es2015', 'stage-0', 'react']
        }
      }
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      Tether: 'tether',
      'window.Tether': 'tether',
    }),
  ],
  devtool: 'source-map',
};
