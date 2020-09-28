const path = require("path");

module.exports = {
  /* Set the mode to run in - obviously it is dynamic now to match the environment */
  //mode: process.env.NODE_ENV,
  /* Defined the entry point for the configuration */
  entry: {
    /* Specify what files I wish webpack to compile, and the name associated with them */
    /* You don't need to specify components that are only imported, such as the Button component */
    app: "./react/App.tsx",
  },
  //devtool: isProd ? false : 'inline-source-map',
  /* Defines where to place the bundles file(s) */
  output: {
    /* The [name] will be the property name of whatever file is being processed, e.g. see the above entry,
    *  we define the property name "header" to the header component, and when webpack transpiles this, the
    *  filename will be "header.js */
    filename: "[name].js",
    /* Dir to output the files in */
    path: __dirname + "/public/js/",
  },
  module: {
    /* Any file that comes through webpack will need to be processed, so we define some rules, and those rules
    *  specify what we do with the files. Without any of the below rules, it would throw an error because
    *  there wouldnt be anything handling a JSX file, or CSS file */
    rules: [
      /* JSX processing */
      {
        /* Allow JSX files to be processed */
        test: /\.jsx$/,
        exclude: /node_modules/,
        /* And to process them, pass them through the babel-loader module */
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      /* CSS processing */
      {
        /* Allow CSS files to be processed - this is here because we are using CSS modules inside our
        *  components, so a .css file is bundled with, meaning we need to handle those and tell webpack
        *  that they are CSS modules */
        test: /\.css$/,
        /* Pass the CSS files though the style-loader, then the css-loader to allow them to be processed. */
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              // This caused some cofusion. If you wish to use modules e.g. className={mystylehseet.button} then set this to true, which also jumbles up the class name in the browser
              // which i assume helps with CSS Confusion. You can also set it to false (or comment out) to specifically set the classnames e.g. classname="button"
              modules: true,
              importLoaders: 1,
            },
          },
        ],
      },
      // tsx
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  /* See: https://webpack.js.org/concepts/module-resolution/ */
  resolve: {
    alias: {
      react: path.resolve("./node_modules/react"),
    },
    extensions: [".js", ".jsx", ".css", ".tsx"],
  },
};
