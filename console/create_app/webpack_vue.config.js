module.exports = {
  entry: {
    app: './vue/app.vue'
  },
  output: {
    filename: "[name].js",
    path: './public/js/'
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
      }
    ]
  },
  resolve: {
    extensions: ['.vue', '.js']
  }
}