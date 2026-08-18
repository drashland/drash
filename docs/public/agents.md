# Drash for coding agents

Drash is a microframework for HTTP services, with zero dependencies. **It ships
no server.** You build a chain of handlers and hand it requests from whatever
server the runtime already gives you. Know that before writing any of it; almost
every wrong guess about Drash comes from assuming it starts a server for you.

It runs on Deno, Node, Bun, and Cloudflare Workers. Exactly four things differ
between them — the install command, the entry point, the server glue, and the
run command. Everything else on this page is the same everywhere.

## 0. Before you start

**Ask the user which runtime this project targets, and wait for the answer.** Do
not pick one for them, and do not start writing files first.

- **Deno** — Native entry point, `Deno.serve`, and a pinned dep in `deno.json`
- **Node** — Polyfill entry point, `node:http`, request in a context object
- **Bun** — Polyfill entry point, fed by `Bun.serve`
- **Cloudflare Workers** — Native entry point, fed by a Worker `fetch` handler

Skip the question if they already told you — "set up a Drash project on Bun" is
an answer. Ask once. Everything below branches on it, so guessing wrong means
rewriting the file rather than editing a line.

Assume the runtime is already installed. If it is missing, or older than the
floor below, stop and tell the user — do not install or upgrade it for them.

| Runtime            | Minimum                                       |
| ------------------ | --------------------------------------------- |
| Deno               | 2.x                                           |
| Node               | 20                                            |
| Bun                | 1.x                                           |
| Cloudflare Workers | `compatibility_date` of `2025-05-01` or later |

Workers has no version number; the equivalent knob is `compatibility_date` in
`wrangler.jsonc`. `Request` and `Response` are unconditionally available there
at any date, but `URLPattern` is not one implementation: dates before
`2025-05-01` get workerd's original one, which is **not** compliant with the
WHATWG URLPattern Standard, and `2025-05-01` onward get the spec-compliant one
(the `urlpattern_standard` flag). Drash's native build matches against the
global `URLPattern`, so pin the standard one:

```jsonc
{ "compatibility_date": "2025-05-01" }
```

Reach for the `urlpattern_original` flag only if something else in the Worker
depends on the old behavior.

For Deno, Appendix A covers the rest: how the sandbox behaves, the skills to
work from, and where the docs are.

## 1. Add Drash

v3 is in beta and published releases have moved between `preview` and `beta`
tags, so pin a version rather than tracking a range.

| Runtime            | Install                                              |
| ------------------ | ---------------------------------------------------- |
| Deno               | `deno add npm:@drashland/drash`                      |
| Node               | `npm install @drashland/drash`                       |
| Bun                | `bun install @drashland/drash`                       |
| Cloudflare Workers | `npm install @drashland/drash` + `npm i -D wrangler` |

Then confirm what actually landed before writing against it. **The import
subpaths have changed between releases**, so trust the installed package over
any example you have seen, including this one. The direct look is the reliable
one:

```sh
ls node_modules/@drashland/drash/modules/   # Node, Bun, Workers
deno info npm:@drashland/drash              # Deno
```

If what you find disagrees with §2, the installed package wins.

## 2. Which entry point

Two builds, differing only in the `URLPattern` implementation they use. This is
decided by the runtime, not by preference:

| Runtime            | `URLPattern`      | Entry point                |
| ------------------ | ----------------- | -------------------------- |
| Deno               | Global            | `modules/http.native.js`   |
| Cloudflare Workers | Global            | `modules/http.native.js`   |
| Node               | Varies by version | `modules/http.polyfill.js` |
| Bun                | Not dependable    | `modules/http.polyfill.js` |

```ts
import { Chain, Resource } from "@drashland/drash/modules/http.native.js";
// or
import { Chain, Resource } from "@drashland/drash/modules/http.polyfill.js";
```

One app uses one of them. Never both.

In CommonJS, drop the extension:

```js
const { Chain, Resource } = require("@drashland/drash/modules/http.polyfill");
```

On Deno, that bare specifier is what `deno add` mapped in `deno.json`. **Do not
also prefix it with `npm:`** — that bypasses the mapping and pins nothing. For a
single-file Deno script with no `deno.json`, skip `deno add` and import the full
specifier directly — `npm:@drashland/drash/modules/http.native.js` or
`https://esm.sh/@drashland/drash/modules/http.native.js`.

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

**A chain** wires resources into a pipeline. Build it once, at module scope, and
reuse it across requests:

```ts
const chain = Chain.builder().resources(Home, Users).build();
```

What a request method receives and returns depends on what you feed the chain,
which is §4. On Deno, Bun, and Workers it is a Web `Request` and you return a
`Response`, as above. On Node it is a context object you build, and you write to
it rather than returning. §4 has both.

## 4. Wire it to the server

`chain.handle()` returns a promise and **rejects on error, including a 404**.
Nothing downstream turns that into a response, so **always attach a `.catch()`**
— it is the only thing standing between the user and a hung request.

### Deno

```ts
Deno.serve({
  hostname: "localhost",
  port: 1447,
  handler: (request: Request) =>
    chain
      .handle<Response>(request)
      .catch(() => new Response("Internal Server Error", { status: 500 })),
});
```

### Bun

Identical to Deno apart from the entry point and the server call. Both pass a
Web `Request` straight through and return a Web `Response`.

```ts
Bun.serve({
  hostname: "localhost",
  port: 1447,
  fetch: (request: Request) =>
    chain
      .handle<Response>(request)
      .catch(() => new Response("Internal Server Error", { status: 500 })),
});
```

### Cloudflare Workers

A Worker's entry module is a default export with a `fetch` method.

```js
export default {
  fetch: (request, _bindings) =>
    chain
      .handle(request)
      .catch(() => new Response("Internal Server Error", { status: 500 })),
};
```

**Every named export of a Worker entry module must be a function, a class, or an
`ExportedHandler`.** `workerd` validates named exports at startup, so a stray
`export const hostname = "localhost";` aborts the Worker before it serves
anything. Keep configuration as module-local `const`s, not exports.

### Node

Node is the one that does not look like the others. `node:http` gives you
`IncomingMessage` and `ServerResponse`, not a Web `Request`, and **Drash does
not convert them for you.** You hand the chain a **context object** carrying
whatever your resources need; the chain itself only requires `url` and `method`.

```js
import { createServer } from "node:http";

const hostname = "localhost";
const port = 1447;

class Home extends Resource {
  paths = ["/"];

  GET(context) {
    context.response.end("Hello");
  }
}

const chain = Chain.builder().resources(Home).build();

const server = createServer((request, response) => {
  const context = {
    url: `http://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return chain.handle(context).catch(() => {
    response.statusCode = 500;
    response.end("Internal Server Error");
  });
});

server.listen(port, hostname);
```

Two things to get right, both of which fail quietly:

- **`url` must be absolute.** `request.url` from `node:http` is path-only
  (`/users/1`). A bare path matches nothing and every route 404s.
- **The request method writes to `context.response` and returns nothing.**
  Returning a `Response` object from a Node resource does nothing at all — the
  reply never reaches the socket.

If you would rather write resources against Web `Request`/`Response` under Node,
convert at the boundary and pass a real `Request` into the chain instead. Then
§3 applies unchanged.

## 5. Run it

| Runtime            | Run                           |
| ------------------ | ----------------------------- |
| Deno               | `deno run --allow-net app.ts` |
| Node               | `node app.js`                 |
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
under `modules/middleware/<Name>/mod.js`. None of them are runtime-specific:

```ts
import { CORS } from "@drashland/drash/modules/middleware/CORS/mod.js";
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
- **Do not assume `chain.handle()` writes a response.** It rejects on error,
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
