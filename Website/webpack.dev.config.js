const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const path = require('path')

module.exports = merge(common, {
  mode: 'development',
  output: {
    clean: false,
    chunkFilename: '[name].js?ver=[chunkhash]',
    publicPath: 'auto'
  },
  cache: {
    type: 'filesystem',
    allowCollectingMemory: false,
    version: '1.0.0',
    buildDependencies: {
      config: [__filename, path.resolve(__dirname, 'webpack.common.js')],
      packageLock: [path.resolve(__dirname, 'package-lock.json')]
    }
  },
  snapshot: {
    managedPaths: [path.resolve(__dirname, 'node_modules')],
    immutablePaths: [],
    buildDependencies: {
      hash: true,
      timestamp: true,
    },
    module: {
      timestamp: true,
      hash: true,
    },
    resolve: {
      timestamp: true,
      hash: true,
    },
    resolveBuildDependencies: {
      hash: true,
      timestamp: true,
    },
  },
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
    runtimeChunk: false
  },
  performance: {
    hints: false
  },
  devServer: {
    historyApiFallback: true,
    client: {
      overlay: true
    }
  },
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 4060,
      proxy: 'http://localhost:4061/',
      socket: {
        namespace: `http://localhost:2051/bs`
      },
      files: [
        '**/*.css',
        '**/*.aspx'
      ]
    })
  ],
  watchOptions: {
    ignored: [
      '**/node_modules/**',
      '**/Scripts/Bundle/**'
    ],
    aggregateTimeout: 300,
    poll: false
  }
})
