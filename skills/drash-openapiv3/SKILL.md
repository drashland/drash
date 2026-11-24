---
name: drash-openapiv3
description: Document Drash resources with OpenAPI v3. Use when adding `@OpenAPIv3` to a resource's HTTP methods, generating an `openapi.json` or `openapi.yaml` document from Drash resources, or running `drash-openapi`.
---

# Drash OpenAPI v3

Drash builds the `paths` member of an OpenAPI Specification v3 (OAS v3)
document from decorators on resource methods. The `@OpenAPIv3` decorator only
records a description. It does nothing at request time.

For resource conventions such as file names and the request argument, follow
the `drash-resources` skill.

## Decorate public HTTP methods

Import `OpenAPIv3` from `modules/openapiv3.js`, next to the app's own entry
point. Pass it one OAS v3 Operation Object:

```ts
// Bun and Node import Resource from http.polyfill.js instead.
import {
  type HTTPRequest,
  Resource,
} from "@drashland/drash/modules/http.native.js";
import { OpenAPIv3 } from "@drashland/drash/modules/openapiv3.js";

export class UsersResource extends Resource {
  override paths = ["/users/:id"];

  @OpenAPIv3({
    summary: "Get a user",
    tags: ["users"],
    responses: {
      "200": {
        description: "The user",
        content: { "application/json": { schema: { type: "object" } } },
      },
      "404": { description: "No user has that ID" },
    },
  })
  override GET(request: HTTPRequest) {
    return new Response(`User ${request.params.pathParam("id")}`);
  }
}
```

The specifiers above are npm's. Deno installs Drash from JSR, whose specifiers
drop the `.js`: `@drashland/drash/modules/openapiv3`.

- **Decorate only public instance HTTP methods** (`GET`, `POST`, ...). On any
  other method, a `static` or `#private` method, or a field, the class throws a
  `TypeError` when it is defined.
- **These are standard (TC39 stage 3) decorators.** Do not set
  `"experimentalDecorators": true` in `tsconfig.json`. If the project already
  sets it, tell the user rather than working around it.
- **Status codes are strings:** `"200"`, `"2XX"`, `"default"`. Not `200`.
- **Always include `responses`.** Drash accepts an operation without it, but
  the resulting document does not validate.
- **Decorate overrides too.** An override that is not decorated is
  undocumented; it does not inherit the parent method's description.
- **Leave undecorated methods alone** unless asked. They are omitted from the
  document, so annotating one method at a time is fine.

## Path parameters are derived

`buildPathsObject` converts each path in `paths`:

| Resource path | Document paths                 |
| ------------- | ------------------------------ |
| `/users`      | `/users`                       |
| `/users/:id`  | `/users/{id}`                  |
| `/users/:id?` | `/users` **and** `/users/{id}` |

Each derived parameter is added as `required: true` with a `string` schema. Do
not repeat it in `parameters` just to list it. Declare it only to change it,
using the same `name` and `in: "path"`:

```ts
parameters: [
  {
    name: "id",
    in: "path",
    required: true,
    description: "The user's ID",
    schema: { type: "integer", format: "int64" },
  },
],
```

Query, header, and cookie parameters are never derived. Declare them.

## Generate the document

Whatever generates the document imports the resource files, so the decorators
run. Any file it imports must not start a server on import. Put startup behind
a guard:

```ts
if (import.meta.main) {
  Deno.serve({ port: 1447 }, handler);
}
```

### Node, Bun, and Cloudflare Workers: the CLI

Node cannot import a file that still contains `@OpenAPIv3(...)`. Type stripping
does not remove decorators. Build the resources with the project's existing
compiler (`tsc`, `tsup`, `esbuild`), then run the CLI on the output:

```sh
npx --package @drashland/drash drash-openapi ./build \
  --title "Users API" \
  --api-version 1.0.0 \
  -o openapi.json
```

- `--api-version` is the API's version (`info.version`). `--openapi` is the OAS
  version and defaults to `3.0.3`. Do not confuse them.
- `--server <url>` adds a `servers` entry and can repeat. `--description` sets
  `info.description`.
- The CLI exits 1 when a file cannot be imported or no decorated resource is
  found. Fix the cause; do not hand-write the document instead.
- `Could not import ...` followed by an unexpected-token error means the CLI was
  pointed at source, not build output.

Add the command as a `package.json` script, such as `"openapi"`, after the
build step.

### Deno: a script

Deno runs decorators in TypeScript directly, so no build is needed. Write a
script that imports the resources and wraps `buildPathsObject`:

```ts
// openapi.ts
import { buildPathsObject } from "@drashland/drash/modules/openapiv3";
import { UsersResource } from "./resources/UsersResource.ts";

const document = {
  openapi: "3.0.3",
  info: { title: "Users API", version: "1.0.0" },
  paths: buildPathsObject([UsersResource]),
};

await Deno.writeTextFile(
  "openapi.json",
  JSON.stringify(document, null, 2) + "\n",
);
```

Add it as a `deno.json` task:
`"openapi": "deno run --allow-write=openapi.json openapi.ts"`. When a resource
is added, add it to the `buildPathsObject` list.

## YAML

The CLI writes JSON only. For YAML, pipe it through a converter:

```sh
npx --package @drashland/drash drash-openapi ./build | npx js-yaml > openapi.yaml
```

On Deno, `stringify` the same `document` with `jsr:@std/yaml` and write
`openapi.yaml`.

## Keep it current

If the user wants the committed document checked in CI, regenerate it and fail
on a diff:

```sh
git diff --exit-code openapi.json
```

Full reference: <https://drash.crookse.com/reference/modules/openapiv3>.
