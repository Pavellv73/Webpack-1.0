/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const root = path.resolve(__dirname, '..');

// Поиск всех страниц и добавление их в HtmlWebpackPlugin
const pluginsHTML = [];
const pages = glob.sync(`${path.resolve(root)}/pages/*.pug`);
pages.forEach(file => {
  const base = path.basename(file, '.pug');
  pluginsHTML.push(
    new HtmlWebpackPlugin({
      filename: `${base}.html`,
      template: `${path.resolve(root)}/pages/${base}.pug`
    })
  );
});

// Поиск всех страниц с отдельной scss
const listCSS = [];
const pagesStyles = glob.sync(`${path.resolve(root)}/pages/*.scss`);
pagesStyles.forEach(file => {
  const base = path.basename(file, '.scss');
  listCSS.push(path.resolve(root, `pages/${base}.scss`));
});

module.exports = {
  mode: 'production',
  context: root,
  entry: [
    path.resolve(root, 'assets/index.js'),
    path.resolve(root, 'assets/common.scss'),
    ...listCSS
  ],
  output: {
    path: path.resolve(root, 'dist'),
    publicPath: '/',
    filename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['thread-loader', 'babel-loader']
      },
      {
        test: /\.pug$/,
        use: ['pug-loader']
      },
      {
        test: /\.(scss|css)$/,
        resolve: { extensions: ['.scss', '.css'] },
        use: [
          'thread-loader',
          'style-loader', // creates styles nodes from JS strings
          MiniCssExtractPlugin.loader,
          'css-loader', // translate CSS into CommonJS
          'postcss-loader',
          'sass-loader' // compiles Sass to CSS
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        cache: true
      })
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    }),
    ...pluginsHTML
  ]
};
