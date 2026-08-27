# Drash

A strongly typed, runtime-agnostic web framework for building structured HTTP services in JavaScript, built on Web Standards.

[View Full Documentation](https://drash.crookse.com)

## Install

Starting from an empty directory:

| Runtime            | Initialize    | Add Drash                       |
| ------------------ | ------------- | ------------------------------- |
| Node               | `npm init -y` | `npm install @drashland/drash`  |
| Deno               | `deno init`   | `deno add jsr:@drashland/drash` |
| Bun                | `bun init -y` | `bun add @drashland/drash`      |
| Cloudflare Workers | `npm init -y` | `npm install @drashland/drash`  |

Cloudflare Workers also needs [Wrangler](https://developers.cloudflare.com/workers/wrangler/),
Cloudflare's CLI, to run a Worker locally: `npm install --save-dev wrangler`.

`npm init -y` produces a CommonJS project, which is what the Node example below
expects. For ESM, add `npm pkg set type=module` and import rather than
`require`.

On Deno both steps are optional: the example below imports the full
`jsr:` specifier, which resolves without a `deno.json`. Run `deno add` if you
want the version pinned there and would rather import the bare
`@drashland/drash/...` specifier.

Drash is published to [npm](https://www.npmjs.com/package/@drashland/drash) and
[JSR](https://jsr.io/@drashland/drash). The JSR specifiers carry no file
extension, since JSR resolves through the package's export map; the npm ones
need `.js`.

## Basic Usage

_Note: The following example uses Node and CommonJS. View the [Other Runtimes](#other-runtimes) section below to find an example that fits your project._

Initialize your project and install Drash.

```bash
npm init -y && npm install @drashland/drash
```

Write your Drash application.

```js
// Node's `URLPattern` support varies by version, so use the polyfill entry point
const {
  Application,
  Resource,
} = require("@drashland/drash/modules/http.polyfill");
const { createServer } = require("node:http");

class Home extends Resource {
  paths = ["/"];

  GET(context) {
    context.response.end("Oh so easy");
  }
}

const app = Application
  .builder()
  .resources(Home)
  .build();

const hostname = "localhost";
const port = 1447;

const server = createServer((request, response) => {
  // Node's `node:http` gives you `IncomingMessage` and `ServerResponse`,
  // not a Web `Request`. Drash does not convert them for you — you hand the
  // app a `context` object carrying whatever your resources need. The
  // app only requires `url` and `method`.
  const context = {
    url: `http://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return app
    .handle(context)
    .catch(() => {
      response.statusCode = 500;
      response.statusMessage = "Internal Server Error";
      response.end("Sorry, but we hit an error!");
    });
});

server.listen(port, hostname);
```

Run your app and head to open http://localhost:1447.

```
node app.js
```

## Other Runtimes

The same application code runs everywhere; only the server around it changes. See the examples below to find code that fits your project's requirements.

<details>
<summary><strong>Node (CJS)</strong></summary>

```js
// Node's `URLPattern` support varies by version, so use the polyfill entry point
const {
  Application,
  Resource,
} = require("@drashland/drash/modules/http.polyfill");
const { createServer } = require("node:http");

class Home extends Resource {
  paths = ["/"];

  GET(context) {
    context.response.end("Oh so easy");
  }
}

const app = Application
  .builder()
  .resources(Home)
  .build();

const hostname = "localhost";
const port = 1447;

const server = createServer((request, response) => {
  // Node's `node:http` gives you `IncomingMessage` and `ServerResponse`,
  // not a Web `Request`. Drash does not convert them for you — you hand the
  // app a `context` object carrying whatever your resources need. The
  // app only requires `url` and `method`.
  const context = {
    url: `http://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return app
    .handle(context)
    .catch(() => {
      response.statusCode = 500;
      response.statusMessage = "Internal Server Error";
      response.end("Sorry, but we hit an error!");
    });
});

server.listen(port, hostname);
```

</details>

<details>
<summary><strong>Node (ESM)</strong></summary>

```js
// Requires `npm pkg set type=module`. The ESM specifier keeps its `.js`
// extension; the CommonJS one above drops it.
import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";
import { createServer } from "node:http";

class Home extends Resource {
  paths = ["/"];

  GET(context) {
    context.response.end("Oh so easy");
  }
}

const app = Application
  .builder()
  .resources(Home)
  .build();

const hostname = "localhost";
const port = 1447;

const server = createServer((request, response) => {
  // Node's `node:http` gives you `IncomingMessage` and `ServerResponse`,
  // not a Web `Request`. Drash does not convert them for you — you hand the
  // app a `context` object carrying whatever your resources need. The
  // app only requires `url` and `method`.
  const context = {
    url: `http://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return app
    .handle(context)
    .catch(() => {
      response.statusCode = 500;
      response.statusMessage = "Internal Server Error";
      response.end("Sorry, but we hit an error!");
    });
});

server.listen(port, hostname);
```

</details>

<details>
<summary><strong>Deno (TS)</strong></summary>

```ts
import {
  Application,
  Resource,
} from "jsr:@drashland/drash/modules/http.native";

class Home extends Resource {
  paths = ["/"];

  GET(request: Request) {
    return new Response("Oh so easy");
  }
}

const app = Application
  .builder()
  .resources(Home)
  .build();

Deno.serve({
  hostname: "localhost",
  port: 1447,
  handler: (request: Request): Promise<Response> => {
    return app
      .handle<Response>(request)
      .catch(() => {
        return new Response("Sorry, but we hit an error!", {
          status: 500,
          statusText: "Internal Server Error",
        });
      });
  },
});
```

</details>

<details>
<summary><strong>Bun (TS)</strong></summary>

```ts
import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";

class Home extends Resource {
  paths = ["/"];

  GET(request: Request) {
    return new Response("Oh so easy");
  }
}

const app = Application
  .builder()
  .resources(Home)
  .build();

Bun.serve({
  hostname: "localhost",
  port: 1447,
  fetch(request: Request): Promise<Response> {
    return app
      .handle<Response>(request)
      .catch(() => {
        return new Response("Sorry, but we hit an error!", {
          status: 500,
          statusText: "Internal Server Error",
        });
      });
  },
});
```

</details>

<details>
<summary><strong>Cloudflare Workers (JS)</strong></summary>

```js
import { Application, Resource } from "@drashland/drash/modules/http.native.js";

class Home extends Resource {
  paths = ["/"];

  GET(request) {
    return new Response("Oh so easy");
  }
}

const app = Application
  .builder()
  .resources(Home)
  .build();

const handleRequest = (request, _bindings) => {
  return app
    .handle(request)
    .catch(() => {
      return new Response("Sorry, but we hit an error!", {
        status: 500,
        statusText: "Internal Server Error",
      });
    });
};

export default { fetch: handleRequest };
```

</details>

## Errors Are Yours to Answer

`app.handle()` returns a promise that **rejects** on error, and Drash writes
nothing to the socket itself &mdash; so the `.catch()` block in each example
above is the only thing standing between an error and the client.

Those blocks are deliberately minimal: they answer every failure with `500`,
including a `404` for an unknown path. Real applications should inspect the
error. Drash throws
[`HTTPError`](https://drash.crookse.com/reference/core/errors/http-error), which
carries the status it means:

```js
app
  .handle(request)
  .catch((error) => {
    if (error.name === "HTTPError") {
      return new Response(error.message, {
        status: error.status_code,
        statusText: error.status_code_description,
      });
    }

    return new Response("Internal Server Error", { status: 500 });
  });
```

See [Error Handling](https://drash.crookse.com/docs/error-handling) for the
per-runtime versions.

## License

[GPL-3.0-or-later](./COPYING)
