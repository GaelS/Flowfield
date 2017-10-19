const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"],
            plugins: [
              "babel-preset-flow",
              "babel-plugin-transform-object-rest-spread"
            ]
          }
        }
      }
    ]
  }
};