const webpack = require("webpack");
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

// Versions
const latestRelease = "v0.27.4";
const denoVersion = "0.27.0";
const denoStdVersion = "0.27.0";

function getConf(envVars) {

  let conf = {
    base_url: !envVars.base_url
      ? ""
      : envVars.base_url,
    build_date: envVars.build_date,
    deno_version: envVars.deno_version.replace("deno: ", "Deno v")
      .replace("\nv8: ", ", V8 v")
      .replace("\ntypescript: ", ", and TypeScript v"),
    deno_version_requirement: `v${denoVersion}`,
    deno_std_version: denoStdVersion,
    latest_release: `${latestRelease}`,
    module_name: "Drash",
    module_namespace: "Drash",
    shields: {
      requires_deno: `https://img.shields.io/badge/requires%20deno-v${denoVersion}-brightgreen.svg`,
    },
    webpack_mode: envVars.environment
  };

  return conf;
}

module.exports = envVars => {
  let conf = getConf(envVars);

  console.log(`\nRunning "${envVars.environment}" configs.\n`);

  let bundleVersion = "";
  if (envVars.environment == "production") {
    bundleVersion = ".min";
  }

  return {
    entry: path.resolve(__dirname, "public/assets/js/_bundle.js"),
    mode: envVars.environment,
    output: {
      path: path.resolve(__dirname, "public/assets/js/"),
      filename: `bundle${bundleVersion}.js`
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
