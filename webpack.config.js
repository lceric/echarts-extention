const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var pro = {
  libraryTarget: "umd",
  library: ["echarts-extention"],
  path: __dirname + "/dist",
  filename: "[name].min.js"
}
var dev = {
  path: __dirname + "/dist",
  filename: "[name].min.js"
}
console.log(Array.prototype.toString.apply(process.argv).indexOf('development') >= 0)
var isDev = Array.prototype.toString.apply(process.argv).indexOf('development') >= 0
var plugins = []
if (isDev) {
  plugins.shift(new HtmlWebpackPlugin({
    title: 'Hot Module Replacement'
  }))
}
module.exports = {
  entry: {
    "echarts-extention": __dirname + "/index.js"
  },
  output: isDev ? dev : pro,
  devServer: {
    contentBase: "./example",
    hot: true,
    open: true,
    // hotOnly: true,
    openPage: 'extention.html'
  },
  plugins: [
    ...plugins,
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  externals: {
    "echarts/lib/echarts": "echarts",
    "zrender": "zrender"
  }
};
