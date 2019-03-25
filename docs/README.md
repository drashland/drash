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

## Running Dev Env

```shell
$ cd /path/to/deno-drash/docs
$ npm run dev
```

## Building new `index.html` and `public` assets

```shell
$ cd /path/to/deno-drash/docs
$ npm run build
```

## Compile api_reference.json for API Reference page

```shell
$ cd /path/to/deno-drash/docs
$ npm run build-reference
```

## Webpack commands

```shell
$ cd /path/to/deno-drash/docs
$ npm run webpack-dev          # Build a new bundle
$ npm run webpack-dev-watch    # Build a new bundle and watch for file changes
```

## Compile SASS to CSS

```shell
$ cd /path/to/deno-drash/docs
$ npm run sass
```
