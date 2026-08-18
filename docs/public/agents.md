# Drash and Deno for coding agents

Sections 1–4 cover the Deno runtime. Sections 5–8 cover Drash, the HTTP
framework. To set up a Drash/Deno project you need §1 and §5–7; the rest is
supporting material.

Deno is a JavaScript and TypeScript runtime distributed as a single binary. That
binary is also the package manager, formatter, linter, test runner, type
checker, and compiler. It runs TypeScript directly, so a script needs no build
step and no `tsconfig.json` — `deno main.ts` is the whole workflow.

The one behavior that surprises people coming from Node: programs are sandboxed.
No filesystem, network, environment, or subprocess access is granted unless
asked for, via `--allow-*` flags. When something fails with
`Requires net access to "..."`, add that specific permission rather than
reaching for `-A`.

## Assumptions to drop

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

## 1. Get the CLI

```sh
deno --version
```

If that prints 2.9 or later you are set. If it prints something older, run
`deno upgrade`. If the command is missing, tell the user you would like to
install Deno, show them how, and run one of these only once they agree:

```sh
# macOS / Linux
curl -fsSL https://deno.land/install.sh | sh
# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex
# Homebrew (macOS / Linux)
brew install deno
# npm
npm install -g deno
```

Deno installs as a standalone binary. It adds nothing to the project and no
dependency to `package.json`.

## 2. Get the skill

Deno maintains agent skills covering dependency management, permissions,
configuration layout, the built-in toolchain, publishing, and migration. Work
from those rather than from this page — they go deeper and track the runtime.

If the user agrees, install them. This touches no project source and adds no
dependency:

```sh
dx skills add denoland/skills --skill deno
```

`dx` is Deno's `npx` equivalent and ships with the binary you installed above,
so this needs no Node. If you would rather use Node, `npx skills add ...` is
identical.

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

## 3. Reading the docs

`deno <subcommand> --help` is authoritative and version-accurate — check it
before guessing at a flag.

Beyond that:

- <https://docs.deno.com/llms.txt> — index of the documentation
- Any docs page also serves its markdown source: append `.md` to the URL, as in
  <https://docs.deno.com/runtime/fundamentals/security.md>
- <https://docs.deno.com/api/> — the `Deno.*` API reference
- `deno doc jsr:@std/path` — a package's API without leaving the terminal

## 4. If you were asked to adopt Deno

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

## 5. Add Drash

Drash is a microframework for HTTP services, with zero dependencies. **It ships
no server.** You build a chain of handlers and hand it requests from whatever
server the runtime already gives you — `Deno.serve` here. Know that before
writing any of it; almost every wrong guess about Drash comes from assuming it
starts a server for you.

v3 is in beta and published releases have moved between `preview` and `beta`
tags, so pin a version rather than tracking a range:

```sh
deno add npm:@drashland/drash
```

Then confirm what actually landed before writing against it — **the import
subpaths have changed between releases**, so trust the installed package over
any example you have seen, including this one:

```sh
deno info npm:@drashland/drash
```

### Which entry point

Two builds, differing only in the `URLPattern` implementation they use. Deno has
a global `URLPattern`, so use the **native** build:

```ts
import {
  Chain,
  Resource,
} from "@drashland/drash/modules/chains/RequestChain/mod.native.js";
```

That bare specifier is what `deno add` mapped in `deno.json`. **Do not also
prefix it with `npm:`** — that bypasses the mapping and pins nothing.

`mod.polyfill.js` is for targets with no global `URLPattern` — Node and Bun. It
runs on Deno, but ships a polyfill you do not need.

For a single-file script with no `deno.json`, skip `deno add` and import the
full specifier directly — `npm:@drashland/drash/modules/...` or
`https://esm.sh/@drashland/drash/modules/...`, both serving the same paths.

## 6. The shape of an app

Three pieces, in this order.

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

**A chain** wires resources into a pipeline:

```ts
const chain = Chain.builder().resources(Home, Users).build();
```

**The runtime's server** feeds it. `chain.handle()` returns a promise and
**rejects on error, including a 404** — nothing downstream turns that into a
response, so always attach a `.catch()`:

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

### Middleware

Middleware is a class that wraps a resource, not a function in a stack. Four
ship with the framework — `AcceptHeader`, `CORS`, `ETag`, `RateLimiter` — each
under `modules/middleware/<Name>/mod.js`:

```ts
import { CORS } from "@drashland/drash/modules/middleware/CORS/mod.js";
```

How middleware is attached to resources has changed across v3 releases. Check
<https://drash.crookse.com/docs/middleware> against your installed version
rather than guessing.

## 7. Run it

```sh
deno run --allow-net app.ts
```

`--allow-net` is the only permission a plain Drash service needs. Add others as
the app genuinely needs them — `--allow-env` for config, `--allow-read` for
static files — rather than reaching for `-A`.

## 8. What not to do

- **Do not add Express middleware.** `body-parser`, `cors`, `helmet` and the
  rest expect Express's `req`/`res` objects and will not work here.
- **Do not use `this.request` or `this.response`.** A resource receives the
  request as an argument and returns a response. v2 had those properties; v3
  removed them deliberately.
- **Do not restructure a project to adopt Drash.** It is a dependency and a few
  classes, not a project layout.
- **Do not put unrelated logic in a resource.** A resource named `Users` serving
  `/users` should hold user logic and nothing else.

Docs: <https://drash.crookse.com>. Runtime-specific setup, including Node, Bun,
and Cloudflare Workers, is under <https://drash.crookse.com/docs/quickstart>.
