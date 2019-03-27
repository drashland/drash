const webpack = require("webpack");
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

function getConf(envVars) {
  let conf = {
    base_url: !envVars.base_url
      ? ""
      : envVars.base_url,
    deno_version: envVars.deno_version.replace("deno: ", "Deno v")
      .replace("\nv8: ", ", V8 v")
      .replace("\ntypescript: ", ", and TypeScript v"),
    latest_release: "v0.6.0",
    module_name: "Drash",
    module_namespace: "Drash",
    webpack_mode: envVars.environment
  };

  return conf;
}

module.exports = envVars => {
  let conf = getConf(envVars);

  console.log(`\nRunning "${envVars.environment}" configs.\n`);

  return {
    entry: path.resolve(__dirname, "public/assets/js/_bundle.js"),
    mode: envVars.environment,
    output: {
      path: path.resolve(__dirname, "public/assets/js/"),
      filename: "bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.pug$/,
          loader: "pug-plain-loader"
        },
        {
          test: /\.vue$/,
          loader: "vue-loader"
        },
        // this will apply to both plain `.js` files
        // AND `<script>` blocks in `.vue` files
        {
          test: /\.js$/,
          loader: "babel-loader"
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
        "process.env": {
          conf: JSON.stringify(conf)
        }
      })
    ],
    resolve: {
      alias: {
        vue:
          envVars.environment == "production"
            ? "vue/dist/vue.min.js"
            : "vue/dist/vue.js",
        "/src": path.resolve(__dirname, "src"),
        "/components": path.resolve(__dirname, "src/vue/components"),
        "/public": path.resolve(__dirname, "public")
      }
    }
  };
};
