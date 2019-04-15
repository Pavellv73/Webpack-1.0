/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const root = path.resolve(__dirname, '..');
const cacheDir = path.resolve(__dirname, '..', 'node_modules', '.cache');

const getThreadLoader = name => ({
  loader: 'thread-loader',
  options: {
    workerParallelJobs: 50,
    poolRespawn: false,
    name
  }
});

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
  mode: 'development',
  context: root,
  entry: [
    path.resolve(root, 'assets/index.js'),
    path.resolve(root, 'assets/common.scss'),
    ...listCSS
  ],
  output: {
    path: path.resolve(root, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: path.resolve(cacheDir, 'js')
            }
          },
          getThreadLoader('js'),
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: path.resolve(cacheDir, 'babel')
            }
          }
        ]
      },
      {
        test: /\.pug$/,
        use: ['pug-loader']
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: path.resolve(cacheDir, 'css')
            }
          },
          getThreadLoader('css'),
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  optimization: {
    runtimeChunk: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
    }),
    new webpack.HashedModuleIdsPlugin({
      hashFunction: 'md4',
      hashDigest: 'base64',
      hashDigestLength: 8,
    }),
    ...pluginsHTML
  ],
  devServer: {
    host: '0.0.0.0',
    port: 9000,
    contentBase: [path.resolve(root, 'static')],
    compress: true,
    hot: true,
    open: true
  },
  devtool: process.env.npm_config_sourcemaps ? 'inline-source-map' : 'inline-eval'
};
