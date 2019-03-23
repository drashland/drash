const webpack = require("webpack");
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");


const conf = {
  latest_release: "v0.5.0",

  development: {
    module_name: "Drash",
    module_namespace: "Drash",
    base_url: "",
    paths: {
      docs_root: "/var/www/deno-drash/docs"
    },
    webpack: {
      mode: "development",
      entry: "public/assets/js/_bundle.js",
      output: {
        path: "public/assets/js/",
        filename: "bundle.js"
      }
    }
  },

  production: {
    module_name: "Drash",
    module_namespace: "Drash",
    base_url: "/deno-drash",
    paths: {
      docs_root: "/var/www/deno-drash/docs"
    },
    webpack: {
      mode: "production",
      entry: "public/assets/js/_bundle.js",
      output: {
        path: "public/assets/js/",
        filename: "bundle.js"
      }
    }
  }
}

module.exports = envVars => {
  const CONF_FILE = require(path.resolve(__dirname, "conf/conf.json"));
  let conf = CONF_FILE[envVars.environment];
  conf.latest_release = CONF_FILE.latest_release;
  conf.deno_version = envVars.deno_version.replace("deno: ", "Deno v")
    .replace("\nv8: ", ", V8 v")
    .replace("\ntypescript: ", ", and TypeScript v");

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
          conf.webpack.mode == "production"
            ? "vue/dist/vue.min.js"
            : "vue/dist/vue.js",
        "/src": path.resolve(__dirname, "src"),
        "/components": path.resolve(__dirname, "src/vue/components"),
        "/conf": path.resolve(__dirname, "conf")
      }
    }
  };
};
