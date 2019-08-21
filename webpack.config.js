/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
