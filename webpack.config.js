const webpack = require('webpack')
const { merge } = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const EslintWebpackPlugin = require('eslint-webpack-plugin')
const CommentJson = require('comment-json')
const path = require('path')
const package_json = require('./package.json')
const fs = require('fs')
const manifest_json = (function () {
  return CommentJson.parse(fs.readFileSync('./src/manifest.json').toString(), null, true)
})()

// webpack config for common
const commonConfig = {
  mode: process.env.NODE_ENV,
  context: path.resolve(__dirname, './src'),
  entry: {
    'background/index': './background/index.ts',
    'options/index': './options/index.ts',
    'popup/index': './popup/index.ts'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
	resolve: {
    extensions: [
      '.ts',
      '.vue'
    ],
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': '@vue/runtime-dom'
    }
  },
  target: [
    'web'
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        },
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                indentdSyntax: true
              }
            }
          }
        ]
      },
      {
        // Refer: https://qiita.com/yuusuke510/items/af3adfd17af0114f4a2a
        test: /\.pug$/,
        oneOf: [
          // this applies to pug imports inside JavaScript
          {
            exclude: /\.vue$/,
            use: [
              'raw-loader',
              'pug-plain-loader'
            ]
          },
          // this applies to `<template lang="pug">` in Vue components
          {
            use: [
              'pug-plain-loader'
            ]
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        APP_NAME: JSON.stringify(manifest_json.name),
        REPO_ENV: JSON.stringify(process.env.REPO_ENV)
      },
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false'
    }),
    new VueLoaderPlugin(), // for Vue3
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new EslintWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        // manifest.json
        {
          from: './manifest.json',
          to: './manifest.json',
          transform: {
            transformer: (content) => {
              const json = JSON.parse(transformJson(content))
              json.version = package_json.version
              return JSON.stringify(json, null, 2)
            },
            cache: true
          }
        },
        // icons
        {
          from: './icons',
          to: './icons'
        },
        // options
        {
          from: './options/index.html',
          to: './options/index.html',
          transform: {
            transformer: transformHtml,
            cache: true
          }
        },
        // popup
        {
          from: './popup/index.html',
          to: './popup/index.html',
          transform: {
            transformer: transformHtml,
            cache: true
          }
        }
      ]
    })
  ]
}

// webpack config for production
const productionConfig = {}

// webpack config for development
const developmentConfig = {
  devtool: 'inline-source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin()
    ],
  }
}

// transform content
function transformJson (content, _path) {
  const obj = CommentJson.parse(content.toString(), null, true)
  return CommentJson.stringify(obj, null, 2)
}

function transformHtml (content, _path) {
  return content.toString()
}

module.exports = (() => {
  switch(process.env.NODE_ENV) {
    case 'development':
      return merge(commonConfig, developmentConfig);
    case 'production':
      return merge(commonConfig, productionConfig);
    default:
      throw new Error('No matching configuration was found!');
  }
})()