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

A request method receives the request as its argument. There is no
`this.request` or `this.response`; v2 had them and v3 removed them.

```ts
import { Resource } from "@drashland/drash/modules/http.polyfill.js";

export class UsersResource extends Resource {
  paths = ["/users/:id"];

  GET(request: Request) {
    return new Response(`User ${request.params.pathParam("id")}`);
  }
}
```

Import `Resource` from the same entry point (`http.native` or `http.polyfill`)
as the rest of the app. Do not mix the two.

## One concern per resource

A resource holds the logic for its own paths and nothing else. `UsersResource`
serving `/users` holds user logic. Shared logic goes in a plain module that
resources import, or in middleware.
