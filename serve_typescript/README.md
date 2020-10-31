# ServeTypeScript

ServeTypeScript is a compile time middleware that allows you to write front-end TypeScript and serve it as compiled JavaScript during runtime.

_Note: Since this middleware uses `Deno.compile()`, it can only be used with Deno's `--unstable` flag (e.g., `deno run --unstable app.ts`)._

## Table of Contents

* [Usage](#usage)
* [Configuration](#configuration)
* [Tutorials](#tutorials)
    * [Writing Front-end TypeScript](#writing-front-end-typescript)
        * [Folder Structure End State](#folder-structure-end-state)
        * [Steps](#steps)
        * [Verification](#verification)

## Usage

```typescript
// Import the ServeTypeScript middleware function
import { ServeTypeScript } from "https://deno.land/x/drash_middleware@v0.6.1/serve_typescript/mod.ts";

// Instantiate ServeTypeScript and pass in the files you want compiled during compile time. The compiled output of these files will be used during runtime.
const serveTs = ServeTypeScript({
  files: [
    {
      source: Deno.realPathSync("./ts/my_ts.ts"), // the path to the actual TypeScript file
      target: "/ts/my_ts.ts", // the URI this file is accessible at (e.g., localhost:1447/ts/my_ts.ts)
    },
  ],
});
```

## Configuration

### `files`

This config is required. ServeTypeScript cannot run unless it is given files to compile during compile time. Compile time is when the Drash server is being created.

```typescript
const serveTs = ServeTypeScript({
  files: [
    {
      source: "/path/to/typescript/file.ts",
      target: "/uri/to/associate/the/typescript/file/to.ts",
    }
  ]
});
```

The `source` is the filepath to the actual TypeScript file. The `target` is the URI that the file is accessible at. For example, if you want to serve your TypeScript file at the `/ts/my_ts.ts` URI, then define `target` as `/ts/my_ts.ts`. When a request is made to `http://yourserver.com/ts/my_ts.ts`, your compiled TypeScript will be returned as the response.

## Tutorials

### Writing Front-end TypeScript

This tutorial teaches you how to write front-end TypeScript, which gets compiled into JavaScript during server creation (compile time).

#### Folder Structure End State

```
▾ /path/to/your/project/
    ▾ ts/
        my_ts_file.ts
    app.ts
    home_resource.ts
```

#### Steps

1. Create your `app.ts` file.

    ```typescript
    // File: app.ts
    import { Drash } from "https://deno.land/x/drash@v1.2.5/mod.ts";
    import { HomeResource } from "./home_resource.ts";
    import { ServeTypeScript } from "https://deno.land/x/drash_middleware@v0.6.1/serve_typescript/mod.ts";

    const serveTs = ServeTypeScript({
      files: [
        {
          source: "./ts/my_ts_file.ts",
          target: "/assets/my_compiled_ts_file.ts",
        }
      ]
    });
    
    const server = new Drash.Http.Server({
      directory: ".",
      response_output: "text/html",
      resources: [
        HomeResource,
      ],
      middleware: {
        compile_time: [
          serveTs
        ]
      },
      static_paths: [
        "/assets"
      ]
    });
    
    server.run({
      hostname: "localhost",
      port: 1447,
    });
    
    console.log(`Server running at ${server.hostname}:${server.port}`);
    ```

2. Create your `home_resource.ts` file.

    ```typescript
    import { Drash } from "https://deno.land/x/drash@v1.2.5/mod.ts";

    export class HomeResource extends Drash.Http.Resource {

      static paths = ["/"];

      public GET() {
        this.response.body = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Drash</title>
          </head>
          <body>
            <div id="container"></div>
            <script src="/assets/my_compiled_ts_file.ts"></script>
          </body>
        </html>`;

        return this.response;
      }
    }
    ```

3. Create your `my_ts_file.ts`.

    ```typescript
    function greet(name: string): string {
      return "Hello, " + name + "!";
    }
    
    const result = greet("TypeScript user");
    
    document.getElementById("container").innerHTML = result;
    ```
    
#### Verification

1. Run your `app.ts` file.

    ```
    deno run --allow-net --allow-read --unstable app.ts
    ```

2. Navigate to `localhost:1447` in your browser.

You should see the following response:

    ```
    Hello, TypeScript user!
    ```

3. Check out the Network tab in the browser's inspector. You should see the following when you check the Response tab for the `my_compiled_ts_file.ts` file.

    ```javascript
    "use strict";
    function greet(name) {
        return "Hello, " + name + "!";
    }
    const result = greet("TypeScript user");
    document.getElementById("container").innerHTML = result;
    ```

    Notice that the TypeScript typings are now gone.
