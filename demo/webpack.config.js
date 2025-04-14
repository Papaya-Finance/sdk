const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, '../src/index.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'papaya-sdk.umd.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'p',
      type: 'umd',
    },
    globalObject: 'this'
  },
};