# Drash Docs

## Setup

Add environment variables.

```shell
export DRASH_DIR_ROOT="/path/to/deno-drash"
export DRASH_SERVER_DIRECTORY="/path/to/deno-drash/docs/public"
```

Change to `/docs` directory and install node modules.

```shell
cd /path/to/deno-drash/docs
npm install
```

Install watchdog.

```shell
npm run install-watchdog
```

_The installer warns you about setting Python binaries to your `$PATH` variable. Pay attention to that message._

## Running Dev Environment

The dev environment requires two shells: a shell to run the `docs.ts` app server and a shell to run `webpack`.

The dev environment is watched by `watchmedo`. `watchmedo` acts like `nodemon` for Node.js projects. Every time you save a file, the dev environment will be reloaded.

Run the `docs.ts` app server.

```shell
npm run dev
```

Run `webpack` and have it watch for file changes.

```shell
npm run dev-webpack-watch
```

## Compile SASS to CSS

* `webpack` doesn't currently watch the `.scss` files. So, if you make changes to a `.scss` file, then make sure you run `npm run sass` to compile your changes.

## Formatting Code

Deno's style guidelines enforce the use of the `prettier` module. You can use `npm` to run it:

```shell
npm run prettier
```

## Unit Tests

```shell
npm run tests
```

## .DS_Store Cleanup

```shell
npm run delete-ds-store
```

## Debugging

`watchdog` kills the `docs.ts` app server before reloading, but sometimes it fails to do it. You can manually kill the app server by running:

```shell
npm run dev-kill
```
