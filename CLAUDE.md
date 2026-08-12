# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Drash v3 — a runtime-agnostic microframework for building JavaScript/TypeScript HTTP systems. It ships no server. Consumers build a chain of handlers and pass a request (or a context object) into `chain.handle()` from whatever server their runtime provides (`Deno.serve`, `node:http`, `Bun.serve`, a Cloudflare Worker `fetch`). Supported targets: Deno, Node, Bun, Cloudflare Workers.

The source is written in Deno style (`.ts` extensions in import specifiers, JSR/`@std` deps) and built with tsup into `dist/` as CJS + ESM + `.d.ts` for npm.

## Commands

All tasks run through Deno (`deno task <name>`), even the ones that shell out to pnpm/vitest/bun. Package manager is pnpm.

```
deno task build:libs             # doit.ts (stage dist/) + tsup CJS/ESM/dts build
deno task check:file-headers     # verify GPL header on every src/ + tests/ file
deno task check:file-headers --write   # NOT a task; run the script directly to add missing headers:
                                       #   deno run --allow-read --allow-write ./scripts/check_file_headers.ts --write
deno lint
deno fmt                         # 2-space, double quotes, semicolons, 80 cols
deno fmt --check
deno task test:all               # bun + deno + node + middleware + unit
deno task test:unit              # tests/unit — imports from src/ directly
deno task test:compat:deno
deno task test:compat:deno:concurrency   # run separately; excluded from test:compat:deno
deno task test:compat:node       # requires `deno task build:libs` first
deno task test:compat:bun        # requires `deno task build:libs` first
deno task test:compat:cloudflare # requires `deno task build:libs` first (not yet in CI)
deno task test:middleware:deno
deno task build:check            # full pre-release gate: headers + clean install + build + test:all
```

Running a single test:

```
deno test tests/unit/standard/handlers/RequestValidator_test.ts
deno test tests/compat/deno/v1.x/modules/RequestChain/native/default-behavior/app_test.ts
pnpm exec vitest run --config vitest.config.node.mts -t "some test name"
```

CI (`.github/workflows/*.code_validation.yml`) gates every test job behind `check:file-headers`, `deno lint`, and `deno fmt --check`, so run those three before considering a change done.

## Repository invariants

- **Every `.ts` file under `src/` and `tests/` must carry the GPL file header verbatim** (see `scripts/check_file_headers.ts`). New files fail CI without it.
- **Compat tests import from `dist/`, not `src/`.** They deliberately exercise the artifact that gets published to npm, so any `src/` change must be followed by `deno task build:libs` before the Node/Bun/Cloudflare compat suites will reflect it. Unit tests (`tests/unit`) import from `src/` and need no build.
- Node and Cloudflare compat tests are split by Node major (`node-v20.x`, `node-v22.x`, `node-v24.x`). `vitest.config.utils.mts` picks the directory matching the running Node version, falling back to the newest directory not ahead of it. Adding a new Node major means adding a directory, not editing config.
- `dist/` is gitignored; it is a build output.
- Public API is marked in each file by a `// FILE MARKER - PUBLIC API` comment followed by the export statement. Keep exports there.
- Branch model (from README): `v3.x` is the supported line; `main` and `*-beta` / `*-staging` are unstable. The repo does not accept outside pull requests.

## Architecture

### Chain of Responsibility

The whole request lifecycle is a linked list of `Handler`s (`src/standard/handlers/Handler.ts`). Each handler implements `handle(input)`, does its work, and calls `super.sendToNextHandler(input)` — passing along a mutated/enriched input object rather than a fixed request type. `setNext()` links them; `AbstractChainBuilder.link()` wires a list into a chain and returns the head.

`RequestChain.Builder` (`src/modules/base/RequestChain.ts`) assembles the standard HTTP chain in this fixed order:

1. `RequestValidator` — rejects inputs lacking a readable `url` / `method`
2. `ResourcesIndex` — matches `input.url` against each resource's `paths` using a `URLPattern`-like class; caches results by fully-qualified URL; appends `{/}?` so trailing slashes match
3. `ResourceNotFoundHandler` — throws `HTTPError(404)` when the index found nothing
4. `RequestParamsParser` — defines a non-enumerable `params` property on the request
5. `ResourceCaller` — invokes `resource[METHOD](request)`

`chain.handle()` returns a promise; errors (including `HTTPError`) propagate to the caller's `.catch()`, which is where consumers translate them into a runtime-appropriate response. See `examples/`.

### Native vs. polyfill builds

`src/modules/chains/RequestChain/mod.native.ts` and `mod.polyfill.ts` are the two consumer entry points. They export the same surface (`Chain`, `Resource`, `Middleware`, `HTTPError`, `HTTPRequest`); the only difference is which `URLPattern` implementation is handed to the builder — the global `URLPattern` (Deno, Cloudflare) or `src/standard/polyfill/URLPatternPolyfill.ts` (Node, Bun, older runtimes). **Any change to one must be mirrored in the other**, and compat tests exist in `native/` and `polyfill/` pairs for exactly this reason.

Consumers import by subpath, e.g. `@drashland/drash/modules/chains/RequestChain/mod.polyfill`.

### `core` / `standard` / `modules` layering

- `src/core` — types, interfaces, enums (`Status`, `StatusCode`, `Header`, `Method`), `HTTPError`, and the base `Resource`. No behavior beyond `HTTPError`.
- `src/standard` — the default implementations: handlers, `Middleware`, `ResourceGroup`, builders, loggers, the URLPattern polyfill.
- `src/modules` — composed, user-facing pieces built from `standard`: the request chains, request/response builders, and the bundled middleware.

Imports flow one direction (`modules` → `standard` → `core`) and are grouped with `// Imports > Core` / `// Imports > Standard` / `// Imports > Modules` comments. Follow that convention.

### Middleware and resource groups

`Middleware` (`src/standard/http/Middleware.ts`) _extends_ `Resource` — it is a decorator, not a separate concept. It holds `this.original` (the wrapped resource or the next middleware) and forwards via `this.next(input)`. An `ALL()` override intercepts every method; otherwise each HTTP method delegates to the original.

`ResourceGroup.Builder` (`src/standard/http/ResourceGroup.ts`) does the wiring at build time by generating anonymous proxy classes:

- `.middleware(A, B, C)` builds a nested chain `A{original: B{original: C{original: resourceInstance}}}` and returns a `MiddlewareEntryPoint` class extending the original resource, whose HTTP methods delegate to the first middleware.
- `.pathPrefixes("/api/v1")` returns a `PrefixedResourceProxy` that rewrites `this.paths` in its constructor.

Both are applied per resource class, and middleware instances are constructed fresh per resource — do not introduce shared/singleton middleware state across resources.

Bundled middleware in `src/modules/middleware/` (`AcceptHeader`, `CORS`, `ETag`, `RateLimiter`) all follow the same shape: an exported `XMiddleware` class plus a factory `X(options)` that returns an anonymous subclass pre-bound to those options, so it can be passed as a class to `.middleware(...)`.

## Test layout

- `tests/unit` — assertions against `core`/`standard`/`modules` from `src/` (Deno test runner).
- `tests/compat/{bun,deno,node,cloudflare}` — full request-flow apps per runtime, each split into `native/` and `polyfill/` variants and into scenario directories (`default-behavior`, `concurrency`, `resource-groups`, `request-in-context-object`, `node-http-in-context-object`, …). Deno/Bun use `*_test.ts`; Node/Cloudflare use `*.test.ts` under vitest.
- `tests/middleware/deno` — behavioral tests for the bundled middleware, run with `--allow-net`.
- `tests/README.md` documents per-runtime prerequisites.

Bun tests named `URLPattern_not_supported_app_test_.ts` are intentionally disabled (trailing underscore excludes them from the runner) because Bun lacks native `URLPattern`.
