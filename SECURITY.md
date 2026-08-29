# Security Policy

## Supported Versions

| Version | Branch  | Supported                                                   |
| ------- | ------- | ----------------------------------------------------------- |
| 3.x     | `v3.x`  | Yes                                                         |
| 2.x     | `v2.x`  | No &mdash; Deno-only, superseded by v3, no longer developed |
| < 2.0   | &mdash; | No                                                          |

Fixes land on `v3.x` and ship as a new patch release to [npm](https://www.npmjs.com/package/@drashland/drash) and [JSR](https://jsr.io/@drashland/drash). `main` and any `*-beta` or `*-staging` branch are unstable. Do not use these branches.

## Reporting a Vulnerability

Please report privately, using [GitHub's private vulnerability reporting](https://github.com/drashland/drash/security/advisories/new) on this repository. Do not open a public issue for a suspected vulnerability, and do not post details in a discussion or a pull request.

**Please do not open a pull request with a fix.** Describe the problem in the advisory and a maintainer will write the patch.

A useful report includes:

- The version you are on, and whether it came from npm or JSR.
- Which runtime, and which entry point &mdash; `modules/http.native` or `modules/http.polyfill`. The two differ only in the `URLPattern` implementation, and that difference is relevant to anything involving path matching.
- The smallest resource, middleware, or request that reproduces it.
- What an attacker gains. A routing bypass that reaches an unintended resource is very different from a crash in a handler you control.

## What to Expect

Drash is maintained by volunteers, and this project has had long quiet periods &mdash; v3 sat between its final beta and its stable release for roughly two years. A security policy promising a 24-hour response would not be honest.

What is realistic: an acknowledgement within **7 days**, and an assessment within **30 days** of that. If a report is confirmed, the fix ships in a patch release on `v3.x` and the advisory is published with credit unless you ask otherwise. If a report is declined, you will be notified.

If 7 days pass with no acknowledgement, please open a public issue (title: AWAITING SECADV RESPONSE) &mdash; no details.

## Scope

Drash is a JavaScript framework, not a server. It has **no runtime dependencies** &mdash; nothing under `src/` imports an external package &mdash; so there is no third-party dependency surface to report against it.

### In Scope

- **Path matching.** A request reaching a resource whose paths should not have matched it, or failing to reach one that should. This includes the bundled `URLPattern` polyfill (`standard/polyfill/URLPatternPolyfill`) used by the `http.polyfill` entry point.
- **Request params.** `pathParam()` or `queryParam()` returning a value from a different request, or a value the client did not send.
- **Bundled middleware** (`modules/middleware/*`) failing at what it claims to do &mdash; for example the rate limiter miscounting within a single process, or the ETag middleware serving one client's cached response to another.
- **`HTTPError`** disclosing something a consumer did not put in it.
- **Resource groups** leaking state between resources. Middleware instances are constructed per resource by design; a case where they are not is worth reporting.

### Not in Scope

These are documented behaviours, not vulnerabilities. Each is listed with what it actually means for you.

- **Responses are yours.** `app.handle()` returns a promise and rejects on error. Drash never writes to the socket. Whatever your `.catch()` sends &mdash; including a stack trace or an internal message &mdash; is your code's doing, not the framework's. See [Error Handling](https://drash.crookse.com/docs/error-handling/).
- **CORS is enforced by the browser.** The CORS middleware sets `Access-Control-*` headers so a browser can decide. It does not stop a non-browser client such as `curl` from calling a resource. Treat it as a browser hint, never as authorization.
- **The rate limiter is per-process and in memory.** Counts are not shared between instances and do not survive a restart. It protects a single server against a burst; it is not a cluster-wide control and not a defense against a distributed attack.
- **Drash does not authenticate anything.** There is no session, token, or user model in the framework. Authorization is middleware you write.
- **TLS, request size limits, timeouts, and header parsing** belong to the server you plug Drash into &mdash; `Deno.serve`, `node:http`, `Bun.serve`, or a Worker's `fetch`. Report those upstream.
- **A resource throwing on input you control** is an application bug. It becomes a Drash issue only if the input causes the framework to misroute, hang, or cross a request boundary.

If you are unsure which side of that line something falls on, report it privately. A rejected report costs far less than an unreported one.
