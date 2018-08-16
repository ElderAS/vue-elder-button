const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const name = 'vue-elder-button'

module.exports = {
  mode: 'production',
  entry: ['./index.js'],
  output: {
    filename: name + '.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'VueElderButton',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
  resolve: {
    alias: {
      node_modules: path.resolve('node_modules'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: name + '.css',
    }),
    new OptimizeCssAssetsPlugin(),
  ],
}
