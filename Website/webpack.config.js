"use strict";

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');

var appBasePath = './Scripts/App/';
var jsEntries = {};

fs.readdirSync(appBasePath).forEach(function (name) {
  var indexFile = appBasePath + name + '/main.js';

  if (fs.existsSync(indexFile)) {
    jsEntries[name] = ['core-js/stable', 'regenerator-runtime/runtime', indexFile];
  }
});

module.exports = {
  mode: 'production',
  cache: {
    type: 'filesystem'
  },
  entry: jsEntries,
  output: {
    path: path.resolve(__dirname, './Scripts/Bundle/'),
    publicPath: '/Scripts/Bundle/',
    filename: '[name].js',
    chunkFilename: "[name].js?ver=[contenthash]"
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          sourceMap: true
        }
      })
    ]
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }, {
      test: /\.sass$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader?indentedSyntax'
      ]
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.js$/,
      use: [
        "thread-loader",
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      ],
      exclude: /node_modules/
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      type: 'asset/resource',
      generator: {
        filename: 'images/[name].[contenthash][ext]'
      }
    }, {
      test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      type: 'asset/resource',
      generator: {
        filename: 'fonts/[name].[contenthash][ext]'
      }
    }]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json']
  },
  performance: {
    hints: false
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new VueLoaderPlugin(),
    new CleanWebpackPlugin()
  ],
  stats: {
    warnings: false
  }
};
