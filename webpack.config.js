const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const isDev = process.env.NODE_ENV !== "production";

const config = {
  mode: isDev ? "development" : "production",
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [{
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          "css-loader",
          "less-loader"
        ]
      },
      {
        test: /\.ttf/,
        loader: "file-loader",
        options: {
          name: "assets/fonts/[name].[ext]"
        }
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Wing Commander CCG"
    })
  ],
  // devServer: {
  //   contentBase: __dirname,
  //   compress: true,
  //   port: 8080,
  //   hot: true,
  //   writeToDisk: true,
  //   open: true,
  //   liveReload: true
  // },
  optimization: {
    minimize: !isDev
  }
};

module.exports = config;