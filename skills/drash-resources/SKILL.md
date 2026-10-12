---
name: drash-resources
description: Conventions for Drash resource classes. Use when creating, renaming, moving, or editing a class that extends Drash's `Resource`, or when splitting a Drash app into multiple files.
---

# Drash resources

A resource is a class that extends `Resource`, lists its routes in `paths`, and
implements one public method per HTTP method it serves (`GET`, `POST`, ...).
Request methods you leave out answer `501 Not Implemented` on their own.

## File names are PascalCase and match the class

Put one resource class in each file. Name the file after the class, in
PascalCase, with the project's usual extension:

| Class           | File               |
| --------------- | ------------------ |
| `UsersResource` | `UsersResource.ts` |
| `HomeResource`  | `HomeResource.js`  |

Do not use `users.ts`, `users-resource.ts`, `users_resource.ts`, or
`resource.ts`. When you rename the class, rename the file with it, and update
every import.

A single-file app that defines its resources next to the chain is fine. The
rule applies as soon as a resource gets its own file.

## The request is an argument

A request method receives, as its argument, whatever the app passed to
`app.handle()`. There is no `this.request` or `this.response`; v2 had them and
v3 removed them.

On Deno, Bun, and Cloudflare Workers the argument is a Web `Request` with
Drash's `params` attached. Type it as `HTTPRequest`, not `Request`, which has no
`params`. Return a `Response`. Mark `paths` and request methods `override`; Deno
enables `noImplicitOverride` by default:

```ts
// Bun imports from http.polyfill.js instead.
import {
  type HTTPRequest,
  Resource,
} from "@drashland/drash/modules/http.native.js";

export class UsersResource extends Resource {
  override paths = ["/users/:id"];

  override GET(request: HTTPRequest) {
    return new Response(`User ${request.params.pathParam("id")}`);
  }
}
```

On Node the argument is the context object the app built around `node:http`'s
`request` and `response`. Write to `context.response` and return nothing. A
returned `Response` never reaches the client, and the request hangs:

```js
import { Resource } from "@drashland/drash/modules/http.polyfill.js";

export class UsersResource extends Resource {
  paths = ["/users/:id"];

  GET(context) {
    context.response.end(`User ${context.params.pathParam("id")}`);
  }
}
```

If the Node app converts to a Web `Request` before calling `app.handle()`, the
first example applies instead. Check what the app passes in before writing a
resource. See §4 of <https://drash.crookse.com/agents.md> for the full
per-runtime apps.

The specifiers above are npm's. Deno installs Drash from JSR, whose specifiers
drop the `.js`: `@drashland/drash/modules/http.native`.

Import `Resource` from the same entry point (`http.native` or `http.polyfill`)
as the rest of the app. Do not mix the two.

## One concern per resource

A resource holds the logic for its own paths and nothing else. `UsersResource`
serving `/users` holds user logic. Shared logic goes in a plain module that
resources import, or in middleware.
