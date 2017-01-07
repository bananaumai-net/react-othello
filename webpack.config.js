const webpack = require('webpack');

module.exports = {
  entry: './src/app.js',
  output: {
   path: 'dist/',
   filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?importLoaders=1',
          'postcss-loader?sourceMap=inline'
        ]
      }
    ]
  },
  eslint: {
    configFile: './.eslintrc.json'
  },
  postcss: [
    require('postcss-nested')(),
    require('autoprefixer')()
  ]
}
