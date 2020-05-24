const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader')
module.exports = {
  entry: {
    app: './vue/app.js'
  },
  output: {
    filename: "[name].js",
    path: __dirname + '/public/js/'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader'
          }
        ]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ["vue-style-loader", "css-loader"]
      },
    ]
  },
  resolve: {
    extensions: ['.vue', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/views/index.html',
    }),
    new VueLoaderPlugin(),
  ]
}