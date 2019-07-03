/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

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
      }
    ]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "bin")
  },
  resolve: {
    extensions: [
      ".ts",
      ".tsx",
      ".js",
      ".json"
    ]
  }
};
