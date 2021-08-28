const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const noModule = {
  mode: 'development',
  entry: {
    main: './src/lib/main.js',
    console: './src/lib/console.js',
  },
  output: {
    path: path.resolve(__dirname, 'www/js/build/'),
    filename: '[name].build.js',
    chunkFilename: '[name].build.js',
    publicPath: './js/build/',
  },
  module: {
    rules: [
      {
        test: /\.hbs$/,
        use: ['raw-loader'],
      },
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../',
            },
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      crypto: false,
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../../css/build/[name].css',
      // chunkFilename: "../css/[id].css"
    }),
    // new BundleAnalyzerPlugin()
  ],
};

module.exports = [noModule];
