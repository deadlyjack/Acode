const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const WWW = path.resolve(__dirname, 'www');

module.exports = (env, options) => {
  const { mode = 'development' } = options;
  const rules = [
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
    }
  ];

  clearOutputDir();

  const main = {
    mode,
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
      rules,
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
      }),
    ],
  };

  return [main];
}

function clearOutputDir() {
  const css = path.join(WWW, 'css/build');
  const js = path.join(WWW, 'js/build');

  fs.rmdirSync(css, { recursive: true });
  fs.rmdirSync(js, { recursive: true });

  fs.mkdir(css, (err) => {
    if (err) console.log(err);
  });
  fs.mkdir(js, (err) => {
    if (err) console.log(err);
  });
}