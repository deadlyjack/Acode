const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: {
    main: "./src/main.js",
    // eruda: "./src/eruda.js",
    console: "./src/console.js",
  },
  output: {
    path: path.resolve(__dirname, "www/js/build/"),
    filename: "[name].build.js",
    chunkFilename: "[name].build.js",
    publicPath: './js/build/'
  },
  module: {
    rules: [{
        test: /\.hbs$/,
        use: ['raw-loader']
      },
      {
        test: /\.m?js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../../",
              hmr: process.env.NODE_ENV === "development"
            }
          },
          "css-loader?url=false",
          "sass-loader",
          "postcss-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "../../css/build/[name].css",
      // chunkFilename: "../css/[id].css"
    }),
    // new BundleAnalyzerPlugin()
  ]
};