const webpack = require("webpack");
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = envVars => {
  const confFile = require(path.resolve(__dirname, "conf/conf.json"));
  const conf = confFile[envVars.environment];

  console.log(`\nRunning "${envVars.environment}" configs.\n`);

  return {
    entry: path.resolve(__dirname, `${conf.webpack.entry}`),
    mode: conf.webpack.mode,
    output: {
      path: path.resolve(__dirname, `${conf.webpack.output.path}`),
      filename: conf.webpack.output.filename
    },
    module: {
      rules: [
        {
          test: /\.pug$/,
          loader: 'pug-plain-loader'
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        // this will apply to both plain `.js` files
        // AND `<script>` blocks in `.vue` files
        {
          test: /\.js$/,
          loader: 'babel-loader'
        },
        // this will apply to both plain `.css` files
        // AND `<style>` blocks in `.vue` files
        {
          test: /\.scss$/,
          use: [
            "style-loader", // creates style nodes from JS strings
            "css-loader", // translates CSS into CommonJS
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
          ]
        }
      ]
    },
    plugins: [
      // make sure to include the plugin!
      new VueLoaderPlugin(),
      // Add compile time vars
      new webpack.DefinePlugin({
        'process.env': {
          conf: JSON.stringify(conf),
        }
      })
    ],
    resolve: {
      alias: {
        vue: conf.webpack.mode == "production" ? "vue/dist/vue.min.js" : "vue/dist/vue.js",
        "/components": path.resolve(__dirname, "src/vue/components"),
        "/conf": path.resolve(__dirname, "conf")
      },
    }
  };
}
