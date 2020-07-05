const path = require("path");
const { CleanWebpackPlugin } =  require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDev = process.env.NODE_ENV !== "production";

const config = {
  mode: isDev ? "development" : "production",
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader"
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          "file-loader",
        ]
      }
    ],
  },
  plugins: isDev ? [
    new CleanWebpackPlugin(),
  ] : [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin()
  ],
  devtool: isDev ? "source-map" : false,
  devServer: {
    contentBase: __dirname,
    compress: true,
    port: 8080,
    hot: true,
    writeToDisk: true,
    open: true,
    liveReload: true
  },
  optimization: {
    minimize: !isDev
  }
};

module.exports = config;