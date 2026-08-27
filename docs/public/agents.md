# Drash for coding agents

Drash is a microframework for HTTP services, with zero dependencies. **It is not
an HTTP server wrapper.** You build a chain of handlers and hand it requests
from whatever server the runtime already gives you. Know that before writing any
of it; almost every wrong guess about Drash comes from assuming it starts a
server for you.

It runs on Deno, Node, Bun, and Cloudflare Workers. Exactly four things differ
between them — the install command, the entry point, the server glue, and the
run command. Everything else on this page is the same everywhere.

## 0. Before you start

**Ask the user which runtime this project targets, and wait for the answer.** Do
not pick one for them, and do not start writing files first.

- **Node** — Polyfill entry point, `node:http`, request in a context object
- **Deno** — Native entry point, `Deno.serve`, and a pinned dep in `deno.json`
- **Bun** — Polyfill entry point, fed by `Bun.serve`
- **Cloudflare Workers** — Native entry point, fed by a Worker `fetch` handler

Skip the question if they already told you — "set up a Drash project on Bun" is
an answer. Ask once. Everything below branches on it, so guessing wrong means
rewriting the file rather than editing a line.

Assume the runtime is already installed. If it is missing, or older than the
floor below, stop and tell the user — do not install or upgrade it for them.

| Runtime            | Minimum                                       |
| ------------------ | --------------------------------------------- |
| Node               | 20                                            |
| Deno               | 2.x                                           |
| Bun                | 1.x                                           |
| Cloudflare Workers | `compatibility_date` of `2025-05-01` or later |

Workers has no version number; the equivalent knob is `compatibility_date` in
`wrangler.jsonc`. `Request` and `Response` are unconditionally available there
at any date, but `URLPattern` is not one implementation: dates before
`2025-05-01` get workerd's original one, which is **not** compliant with the
WHATWG URLPattern Standard, and `2025-05-01` onward get the spec-compliant one
(the `urlpattern_standard` flag). Drash's native build matches against the
global `URLPattern`, so pin the standard one in `wrangler.jsonc`:

```jsonc
{
  "name": "my-worker",
  "main": "app.js",
  "compatibility_date": "2025-05-01"
}
```

`wrangler dev app.js` does run with no config file at all, but then the
compatibility date is whatever wrangler defaults to — which is the thing this
section is warning about. Write the file.

Reach for the `urlpattern_original` flag only if something else in the Worker
depends on the old behavior.

For Deno, Appendix A covers the rest: how the sandbox behaves, the skills to
work from, and where the docs are.

## 1. Add Drash

Work in the current directory. Do not create a project subdirectory unless the
user asks for one.

v3 is in beta and published releases have moved between `preview` and `beta`
tags, so pin a version rather than tracking a range.

| Runtime            | Install                                              |
| ------------------ | ---------------------------------------------------- |
| Node               | `npm install @drashland/drash`                       |
| Deno               | `deno add jsr:@drashland/drash`                      |
| Bun                | `bun install @drashland/drash`                       |
| Cloudflare Workers | `npm install @drashland/drash` + `npm i -D wrangler` |

Then confirm what actually landed before writing against it. **The import
subpaths have changed between releases**, so trust the installed package over
any example you have seen, including this one. The direct look is the reliable
one:

```sh
ls node_modules/@drashland/drash/modules/   # Node, Bun, Workers
deno info jsr:@drashland/drash              # Deno
```

If what you find disagrees with §2, the installed package wins.

### What else to create

The dependency alone is not a project. Create what your runtime's row lists, and
nothing more:

| Runtime            | Also create                                       |
| ------------------ | ------------------------------------------------- |
| Node               | `package.json` with `"type": "module"`            |
| Deno               | nothing — `deno add` already wrote `deno.json`    |
| Bun                | `package.json` with `"type": "module"`            |
| Cloudflare Workers | `package.json` as for Node, plus `wrangler.jsonc` |

**Do not skip this on Node.** The polyfill entry point is an ES module, so a
`.js` file importing it is ambiguous without the field. On Node 20.0–20.18 that
is fatal: `SyntaxError: Cannot use import statement outside a module`. From Node
20.19 and 22.7 onward, syntax detection rescues it, but Node warns
(`MODULE_TYPELESS_PACKAGE_JSON`) and re-parses the file on every start.
`npm install` does not add the field for you — add it:

```json
{ "type": "module" }
```

The alternative is to name the file `app.mjs` and run `node app.mjs`. If you are
writing CommonJS on purpose, leave `"type"` unset and use the extensionless
`require` form from §2 instead.

`bun install` and `npm install` both create `package.json` if it is missing, but
neither sets `"type"`. The `wrangler.jsonc` for Workers is in §0.

## 2. Which entry point

Two builds, differing only in the `URLPattern` implementation they use. This is
decided by the runtime, not by preference:

| Runtime            | `URLPattern`      | Entry point                |
| ------------------ | ----------------- | -------------------------- |
| Node               | Varies by version | `modules/http.polyfill.js` |
| Deno               | Global            | `modules/http.native.js`   |
| Bun                | Not dependable    | `modules/http.polyfill.js` |
| Cloudflare Workers | Global            | `modules/http.native.js`   |

```ts
import { Application, Resource } from "@drashland/drash/modules/http.native.js";
// or
import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";
```

One app uses one of them. Never both.

In CommonJS, drop the extension:

```js
const { Application, Resource } = require(
  "@drashland/drash/modules/http.polyfill",
);
```

On Deno, that bare specifier is what `deno add` mapped in `deno.json`. **Do not
also prefix it with `npm:`** — that bypasses the mapping and pins nothing. For a
single-file Deno script with no `deno.json`, skip `deno add` and import the full
specifier directly — `jsr:@drashland/drash/modules/http.native`. Note it carries
no file extension: JSR resolves through the package's export map, unlike the npm
specifier the other runtimes use, which needs `.js`.

## 3. The shape of an app

**A resource** is a class with `paths` and HTTP request methods. The class _is_
the route table. There is no `app.get("/path", handler)` in Drash — **do not go
looking for one, and do not build one**:

```ts
class Home extends Resource {
  paths = ["/"];

  GET(request: Request) {
    return new Response("Hello");
  }
}
```

Request methods you leave out answer `501 Not Implemented` on their own, so
implement only what the resource serves.

Path params use `URLPattern` syntax and are read through an accessor, not a
plain property:

```ts
class Users extends Resource {
  paths = ["/users/:id"];

  GET(request: Request) {
    return new Response(`User ${request.params.pathParam("id")}`);
  }
}
```

`request.params.queryParam("sort")` reads the query string.

**An application** wires resources into a pipeline — an HTTP request chain,
under the hood. Build it once, at module scope, and reuse it across requests:

```ts
const app = Application.builder().resources(Home, Users).build();
```

What a request method receives and returns depends on what you feed the chain,
which is §4. On Node it is a context object you build, and you write to it
rather than returning. On Deno, Bun, and Workers it is a Web `Request` and you
return a `Response`, as above. §4 has a complete file for each.

## 4. The whole app, one file per runtime

`app.handle()` returns a promise and **rejects on error, including a 404**.
Nothing downstream turns that into a response, so **always attach a `.catch()`**
— it is the only thing standing between the user and a hung request.

Each block below is a complete file. Write your runtime's block, under the
filename in its heading, in the current directory. Do not stitch together blocks
from two different runtimes.

### Node — `app.js`

This is the only runtime here that does not hand your resources a Web `Request`.
`node:http` gives you `IncomingMessage` and `ServerResponse`, and **Drash does
not convert them for you.** You pass the chain a **context object** carrying
whatever your resources need; the chain itself only requires `url` and `method`.

```js
import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";
import { createServer } from "node:http";

const hostname = "localhost";
const port = 1447;

class Home extends Resource {
  paths = ["/"];

  GET(context) {
    context.response.end("Hello");
  }
}

class Users extends Resource {
  paths = ["/users/:id"];

  GET(context) {
    context.response.end(`User ${context.params.pathParam("id")}`);
  }
}

const app = Application.builder().resources(Home, Users).build();

const server = createServer((request, response) => {
  const context = {
    url: `http://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return app.handle(context).catch(() => {
    response.statusCode = 500;
    response.end("Internal Server Error");
  });
});

server.listen(port, hostname);
```

This file needs `"type": "module"` in `package.json` — see §1.

Two more things to get right, both of which fail quietly:

- **`url` must be absolute.** `request.url` from `node:http` is path-only
  (`/users/1`). A bare path matches nothing and every route 404s.
- **The request method writes to `context.response` and returns nothing.**
  Returning a `Response` object from a Node resource does nothing at all — the
  reply never reaches the socket.

If you would rather write resources against Web `Request`/`Response` under Node,
convert at the boundary and pass a real `Request` into the chain instead. The
Deno block below then applies almost unchanged.

### Deno — `app.ts`

```ts
import { Application, Resource } from "@drashland/drash/modules/http.native.js";

class Home extends Resource {
  paths = ["/"];

  GET(request: Request) {
    return new Response("Hello");
  }
}

class Users extends Resource {
  paths = ["/users/:id"];

  GET(request: Request) {
    return new Response(`User ${request.params.pathParam("id")}`);
  }
}

const app = Application.builder().resources(Home, Users).build();

Deno.serve({
  hostname: "localhost",
  port: 1447,
  handler: (request: Request) =>
    app
      .handle<Response>(request)
      .catch(() => new Response("Internal Server Error", { status: 500 })),
});
```

### Bun — `app.ts`

Identical to Deno apart from the entry point and the server call. Both pass a
Web `Request` straight through and return a Web `Response`.

```ts
import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";

class Home extends Resource {
  paths = ["/"];

  GET(request: Request) {
    return new Response("Hello");
  }
}

class Users extends Resource {
  paths = ["/users/:id"];

  GET(request: Request) {
    return new Response(`User ${request.params.pathParam("id")}`);
  }
}

const app = Application.builder().resources(Home, Users).build();

Bun.serve({
  hostname: "localhost",
  port: 1447,
  fetch: (request: Request) =>
    app
      .handle<Response>(request)
      .catch(() => new Response("Internal Server Error", { status: 500 })),
});
```

### Cloudflare Workers — `app.js`

A Worker's entry module is a default export with a `fetch` method. The chain is
built at module scope and reused across requests in the same isolate.

```js
import { Application, Resource } from "@drashland/drash/modules/http.native.js";

class Home extends Resource {
  paths = ["/"];

  GET(request) {
    return new Response("Hello");
  }
}

class Users extends Resource {
  paths = ["/users/:id"];

  GET(request) {
    return new Response(`User ${request.params.pathParam("id")}`);
  }
}

const app = Application.builder().resources(Home, Users).build();

export default {
  fetch: (request, _bindings) =>
    app
      .handle(request)
      .catch(() => new Response("Internal Server Error", { status: 500 })),
};
```

**Every named export of a Worker entry module must be a function, a class, or an
`ExportedHandler`.** `workerd` validates named exports at startup, so a stray
`export const hostname = "localhost";` aborts the Worker before it serves
anything. Keep configuration as module-local `const`s, not exports.

## 5. Run it

| Runtime            | Run                           |
| ------------------ | ----------------------------- |
| Node               | `node app.js`                 |
| Deno               | `deno run --allow-net app.ts` |
| Bun                | `bun run app.ts`              |
| Cloudflare Workers | `npx wrangler dev app.js`     |

Wrangler prints the address it bound. The others serve `http://localhost:1447`
as written above.

Deno is sandboxed, and `--allow-net` is the only permission a plain Drash
service needs. Add others as the app genuinely needs them — `--allow-env` for
config, `--allow-read` for static files — rather than reaching for `-A`.

## 6. Middleware

Middleware is a class that wraps a resource, not a function in a stack. Four
ship with the framework — `AcceptHeader`, `CORS`, `ETag`, `RateLimiter` — each
under `modules/middleware/<Name>.js`. None of them are runtime-specific:

```ts
import { CORS } from "@drashland/drash/modules/middleware/CORS.js";
```

How middleware is attached to resources has changed across v3 releases. Check
<https://drash.crookse.com/docs/middleware> against your installed version
rather than guessing.

## 7. What not to do

- **Do not add Express middleware.** `body-parser`, `cors`, `helmet` and the
  rest expect Express's `req`/`res` objects and will not work here.
- **Do not use `this.request` or `this.response`.** A resource receives the
  request as an argument. v2 had those properties; v3 removed them deliberately.
- **Do not mix entry points.** One app imports `http.native.js` or
  `http.polyfill.js`, never both.
- **Do not assume `app.handle()` writes a response.** It rejects on error,
  including 404. Without a `.catch()` the request hangs.
- **Do not restructure a project to adopt Drash.** It is a dependency and a few
  classes, not a project layout.
- **Do not put unrelated logic in a resource.** A resource named `Users` serving
  `/users` should hold user logic and nothing else.

Docs: <https://drash.crookse.com>. Per-runtime guides with complete runnable
apps are under <https://drash.crookse.com/docs/quickstart>.

---

## Appendix A. Working in Deno

Relevant only if §0 was answered with Deno.

Deno is a JavaScript and TypeScript runtime distributed as a single binary. That
binary is also the package manager, formatter, linter, test runner, type
checker, and compiler. It runs TypeScript directly, so a script needs no build
step and no `tsconfig.json` — `deno main.ts` is the whole workflow.

The one behavior that surprises people coming from Node: programs are sandboxed.
No filesystem, network, environment, or subprocess access is granted unless
asked for, via `--allow-*` flags. When something fails with
`Requires net access to "..."`, add that specific permission rather than
reaching for `-A`.

### Assumptions to drop

Deno is not a separate ecosystem you have to port a project into:

1. **`deno install` reads `package.json`.** It resolves the same npm packages
   and writes a real `node_modules` directory.
2. **`deno add express` installs from npm.** An unprefixed package name defaults
   to npm, exactly like `npm install`. JSR is opt-in via `jsr:`.
3. **Node built-ins work**, prefixed or not — `node:fs` and `fs` both resolve.
4. **`deno task build` runs a `scripts.build` entry from `package.json`**, just
   as it runs a `tasks.build` entry from `deno.json`.
5. **URL imports are legacy.** `https://deno.land/x/...` still runs, but new
   code should use a bare specifier backed by `npm:` or `jsr:`.

So do not tell a user to rewrite imports, move to JSR, drop `package.json`, or
restructure anything as a precondition for using Deno. The genuine behavioral
differences are permissions and npm lifecycle scripts not running by default.

### A.1 Get the skill

Deno maintains agent skills covering dependency management, permissions,
configuration layout, the built-in toolchain, publishing, and migration. Work
from those rather than from this page — they go deeper and track the runtime.

If the user agrees, install them. This touches no project source and adds no
dependency:

```sh
dx skills add denoland/skills --skill deno
```

`dx` is Deno's `npx` equivalent and ships with Deno itself, so this needs no
Node. If you would rather use Node, `npx skills add ...` is identical.

Add `--skill migrate-to-deno` as well if the project is coming from Node, npm,
Yarn, pnpm, or Bun. In Claude Code you can instead install the whole set as a
plugin:

```
/plugin marketplace add denoland/skills
/plugin install deno-skills@denoland-skills
```

Skip this if an equivalent Deno skill or rule is already present.

**If you cannot install skills**, read them directly — they are plain markdown,
and these URLs always serve the current version:

- <https://raw.githubusercontent.com/denoland/skills/main/skills/deno/SKILL.md>
- <https://raw.githubusercontent.com/denoland/skills/main/skills/migrate-to-deno/SKILL.md>

Other skills in the same repo cover Deno Deploy, Fresh, and sandboxes:
<https://github.com/denoland/skills>.

### A.2 Reading the docs

`deno <subcommand> --help` is authoritative and version-accurate — check it
before guessing at a flag.

Beyond that:

- <https://docs.deno.com/llms.txt> — index of the documentation
- Any docs page also serves its markdown source: append `.md` to the URL, as in
  <https://docs.deno.com/runtime/fundamentals/security.md>
- <https://docs.deno.com/api/> — the `Deno.*` API reference
- `deno doc jsr:@std/path` — a package's API without leaving the terminal

### A.3 If you were asked to adopt Deno

Most Node projects already run under Deno unchanged, so this is a series of
small opt-in wins, not a rewrite. **Never propose one big migration**, and do
not start editing.

Investigate read-only first — dependencies, scripts, the lockfile, the
TypeScript runner, the test and lint setup, CI. Then present what you found as
independent, opt-in steps ordered by how little they disturb, and let the user
choose in one round. Roughly, in increasing order of disruption: use Deno as the
package manager only; run the project with Deno; tighten permissions; and
optionally adopt the built-in toolchain. Nearly all of the value is in the first
three, and the last one is a genuine migration that a working project can
decline indefinitely.

The `migrate-to-deno` skill covers each of those rungs, the errors you will hit,
and per-tool command equivalents. Install it before you start, or read it at the
URL above. Docs: <https://docs.deno.com/runtime/migrate/>.
