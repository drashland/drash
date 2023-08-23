# Drash Tests

This document outlines how to run the tests.

## Integration

### Bun

#### Assumptions

You have Bun installed.

#### How to run tests

```
$ deno task test:integration:bun
```

### Deno

#### Assumptions

You have Deno installed.

#### How to run tests

```
$ deno task test:integration:deno
```

### Node

#### Assumptions

- You have Node installed.
- You built the CJS and ESM modules using `deno task build:all`.
  - The tests import code from Drash's built modules, not the code in the `src` directory. Reason being we want the integration testing to include importing the modules that will be published to the npm registry.
  - The tests will not run without `deno task build:all` being used first.

__Note: The tests are split by Node version in separate directories (e.g., `node-16`, `node-18`, etc.). When you run the Node integration tests, the directory that will be used will be based on the Node version you are using. For example, if you are using Node 16, then the `node-16` directory will be used and the `node-18` directory will be ignored.__

#### How to run tests

```
$ yarn install
$ deno task build:all
$ deno task test:integration:node
```