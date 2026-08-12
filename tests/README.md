# Drash Tests

This document outlines:

- descriptions of the test directories;
- intent behind the tests; and
- how to run the tests.

## Compat

Compat tests assert compatibility in runtimes. They assert request flows using native APIs and polyfills provided by Drash.

### Bun

#### Assumptions

You have Bun installed.

#### How to run tests

```
$ deno task test:compat:bun
```

### Deno

#### Assumptions

You have Deno (latest v2.x) installed.

#### How to run tests

```
$ deno task test:compat:deno
```

### Node

#### Assumptions

- You have Node installed.
- You built the CJS and ESM modules using `deno task build:libs`.
  - The tests import code from Drash's built modules, not the code in the `src` directory. Reason being we want the compat testing to include importing the modules that will be published to the npm registry.
  - The tests will not run without `deno task build:libs` being used first.

### Node versions used

The tests are split by Node version in separate directories (e.g., `node-v20.x`, `node-v22.x`, `node-v24.x`, `node-v26.x`). When you run the Node compat tests, the directory that will be used will be based on the Node version you are using. For example, if you are using Node 22, then the `node-v22.x` directory will be used and the other directories will be ignored.

Using `nvm` (download it at https://github.com/nvm-sh/nvm) can make it easier for you to switch between Node versions to test in specific Node versions (e.g., `nvm use 22` to use Node 22 or `nvm use 24` to use Node 24).

#### How to run tests

```
$ pnpm install
$ deno task build:libs
$ deno task test:compat:node
```

## Unit

Unit tests make assertions against Core, Standard, and Modules.

### How to run tests

```
$ deno task test:unit
```
