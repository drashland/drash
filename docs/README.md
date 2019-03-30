# Drash Docs

## Setup

Add `DRASH_DIR_ROOT` env var.

```shell
export DRASH_DIR_ROOT="/path/to/deno-drash"
```

Change to `/docs` directory and install node modules.

```shell
$ cd /path/to/deno-drash/docs
$ npm install
```

## Running Dev Environment

* The dev environment requires two shells: a shell to run the `docs.ts` app server and a shell to run `webpack`.
* The dev environment is watched by `watchmedo`. `watchmedo` acts like `nodemon` for Node.js projects. Every time you save a file, the dev environment will be reloaded.

Run the `docs.ts` app server.

```shell
$ npm run dev
```

Run `webpack` and have it watch for file changes.

```shell
$ npm run dev-webpack-watch
```

## Compile SASS to CSS

* `webpack` doesn't currently watch the `.scss` files. So, if you make changes to a `.scss` file, then make sure you run `npm run sass` to compile your changes.
