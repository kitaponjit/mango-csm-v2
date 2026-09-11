const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  output: {
    chunkFilename: '[name].js?ver=[chunkhash]',
    clean: true,
    pathinfo: false
  },
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache-prod'),
    buildDependencies: {
      config: [__filename, path.resolve(__dirname, 'webpack.common.js')]
    }
  },
  optimization: {
    chunkIds: 'natural',
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: false,
          },
        }
      })
    ]
  },
  performance: {
    hints: false
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 100
    })
  ]
})
