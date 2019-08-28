/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {GenerateSW} = require("workbox-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: "./src/index.tsx",
  externals: {
    jquery: "jQuery"
  },
  mode: process.env.NODE_ENV ? process.env.NODE_ENV : "production",
  module: {
    rules: [
      {
        exclude: /node_modules|bin/u,
        loader: "ts-loader",
        test: /\.tsx?$/u
      },
      {
        enforce: "pre",
        loader: "source-map-loader",
        test: /\.js$/u
      },
      {
        test: /\.css$/iu,
        use: [
          "style-loader",
          "css-loader"
        ]
      }
    ]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "bin")
  },
  plugins: [
    new GenerateSW({
      runtimeCaching: [
        {
          handler: "StaleWhileRevalidate",
          urlPattern: /^https:\/\/unpkg.com\//u
        },
        {
          handler: "CacheFirst",
          urlPattern: /^https:\/\/(?:maxcdn.bootstrapcdn.com|cdnjs.cloudflare.com)\//u
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: "assets/index.html",
      title: "Codesweets"
    })
  ],
  resolve: {
    extensions: [
      ".ts",
      ".tsx",
      ".js",
      ".json"
    ]
  }
};
