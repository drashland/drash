# Tengine

Tengine allows your Drash application to use a template engine.

## Migrating From Drash.Compilers.TemplateEngine?

If you have received the message about `server.template_engine` being deprecated and are looking for the migration guide, click [here](./drash_migration_guide.md).

## Table of Contents

* [Usage](#usage)
* [Configuration](#configuration)
* [Tutorial: Using Jae](#tutorial-using-jae)
    * [Folder Structure End State](#jae-folder-structure-end-state)
    * [Steps](#jae-steps)
    * [Verification](#jae-verification)
    * [Further Learning](#jae-further-learning)
* [Tutorial: Using Eta](#tutorial-using-eta)
    * [Disclaimer](#disclaimer-related-to-eta)
    * [Folder Structure End State](#eta-folder-structure-end-state)
    * [Steps](#eta-steps)
    * [Verification](#eta-verification)

## Usage

```typescript
// Import the Tengine middleware function
import { Tengine } from "https://deno.land/x/drash_middleware@v0.7.0/tengine/mod.ts";

// Use the default template engine that comes with Tengine, known as Jae.
// Returning false in the render method tells Tengine to use Jae. Specifying
// the views_path config tells Jae where your HTML files are located. The
// views_path config is required if Jae is being used.
const tengine = Tengine({
  render: (...args: unknown[]): boolean => {
    return false;
  },
  views_path: "./views"
});
```

## Configuration

### `render`

This config is required. Tengine uses this method to replace the `.render()` method in Drash's response object. The `...args` must always be of type `unknown[]` because you can use any template engine you want. You just have to specify that template engine's render method in this config so Tengine knows how to render templates.

```typescript
const tengine = Tengine({
  render: (...args: unknown[]): boolean => {
    return false;
  }
});
```

### `views_path`

This config is optional. If you are using the default template engine that comes with Tengine (known as Jae), then this config is required. Otherwise, leave this config out if you are using a different template engine. This config tells Jae where your HTML files are located.

_Note: This config value SHOULD NOT have a trailing slash._

```typescript
const tengine = Tengine({
  render: (...args: unknown[]): boolean => {
    return false;
  },
  views_path: "./views"
});
```

## Tutorial: Using Jae

This tutorial teaches you how to use Jae (Tengine's default template engine).

### Jae: Folder Structure End State

```
▾ /path/to/your/project/
    ▾ views/
        index.html
        template_engines.html
    app.ts
    home_resource.ts
```

### Jae: Steps

1. Create your `app.ts` file.

    ```typescript
    import { Drash } from "https://deno.land/x/drash@v1.3.0/mod.ts";
    import { HomeResource } from "./home_resource.ts";
    import { Tengine } from "https://deno.land/x/drash_middleware@v0.7.0/tengine/mod.ts";

    const tengine = Tengine({
      render: (...args: unknown[]): boolean => {
        return false; // This render method returns false to tell Tengine to use Jae
      },
      views_path: "./views"
    });

    const server = new Drash.Http.Server({
      response_output: "text/html",
      resources: [
        HomeResource,
      ],
      middleware: {
        after_resource: [
          tengine
        ]
      },
    });

    server.run({
      hostname: "localhost",
      port: 1447,
    });

    console.log(`Server running at ${server.hostname}:${server.port}`);
    ```

2. Create your `home_resource.ts` file.

    ```typescript
    import { Drash } from "https://deno.land/x/drash@v1.3.0/mod.ts";

    export class HomeResource extends Drash.Http.Resource {

      static paths = ["/"];

      public GET() {
        // Call the .render() method and specify the first argument as a
        // relative path to the views_path config value. Notice, this
        // argument has a leading slash whereas the views_path config
        // does not have a trailing slash. Having a trailing slash in
        // the views_path config would make Jae look for ...
        //
        //     ./views_path//index.html
        //
        // ... which would cause an error.
        this.response.body = this.response.render(
          "/index.html",
          {
            message: "Hella using Jae.",
            template_engines: [
              {
                name: "dejs",
                url: "https://github.com/syumai/dejs",
              },
              {
                name: "Dinja",
                url: "https://github.com/denjucks/dinja",
              },
              {
                name: "Eta",
                url: "https://github.com/eta-dev/eta",
              }
            ],
          }
        );

        return this.response;
      }
    }
    ```

3. Create your `index.html` file.

    ```html
    <!DOCTYPE html>
    <html class="h-full w-full">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, user-scalable=no"/>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">
        <title>Tengine</title>
      </head>
      <body style="background: #f4f4f4">
        <div style="max-width: 640px; margin: 50px auto;">
          <h1 class="text-5xl mb-5"><% message %></h1>
          <p class="mb-5">Jae is a template engine. Some other template engines are:</p>
          <% include_partial("/template_engines.html") %>
        </div>
      </body>
    </html>
    ```

4. Create your `template_engines.html` file.

    ```html
    <ul class="list-disc ml-5">
      <% for (const index in template_engines) { %>
        <li>
          <span class="text-bold"><% template_engines[index].name %>: </span>
          <a href="<% template_engines[index].url %>" target="_BLANK"><% template_engines[index].url %></a>
        </li>
      <% } %>
    </ul>
    ```

### Jae: Verification

1. Run your `app.ts` file.

    ```
    deno run --allow-net --allow-read app.ts
    ```

2. Navigate to `localhost:1447` in your browser. You should see an HTML page with the following text:

   ```text
   Hella using Jae.
   ```

### Jae: Further Learning

You can learn more about Jae through its tutorials [here](./jae).

## Tutorial: Using Eta

This tutorial teaches you how to use Eta.

### Disclaimer Related To Eta

* Drash Land is not affiliated with the Eta project or its maintainers in any form. Eta is a third-party project. Any issues related to Eta must be filed with Eta and not Drash Land.
* Eta uses unstable Deno APIs. Therefore, you must pass in the `--unstable` flag when you run your application. This means, if you use Eta with Drash, your Drash application will be running under unstable APIs; and your application could break in the future since Deno's unstable APIs are subject to change or be removed without notice.
* The Drash Land team has manually tested using Eta with Tengine. The version of Eta being imported in the code block/s below has/have been verified to work with the latest release of Drash Middleware. If you decide you want to upgrade to a newer version of Eta, please note that your application might break. Do not file an issue with Drash Land if your application breaks in this scenario.

### Eta: Folder Structure End State

```
▾ /path/to/your/project/
    ▾ views/
        index.eta
    app.ts
    home_resource.ts
```

### Eta: Steps

1. Create your `app.ts` file.

    ```typescript
    import { Drash } from "https://deno.land/x/drash@v1.3.0/mod.ts";
    import { HomeResource } from "./home_resource.ts";
    import { Tengine } from "https://deno.land/x/drash_middleware@v0.7.0/tengine/mod.ts";
    import { renderFile, configure } from "https://deno.land/x/eta@v1.6.0/mod.ts"
    
    // Set Eta's configuration
    configure({
      // This tells Eta to look for templates in the ./views/ directory
      views: "./views/"
    })

    const tengine = Tengine({
      render: async (...args: unknown[]): Promise<string>=> {
        return await renderFile(
          args[0] as string,
          args[1] as any,
        );
      }
    });

    const server = new Drash.Http.Server({
      response_output: "text/html",
      resources: [
        HomeResource,
      ],
      middleware: {
        after_resource: [
          tengine
        ]
      },
    });

    server.run({
      hostname: "localhost",
      port: 1447,
    });

    console.log(`Server running at ${server.hostname}:${server.port}`);
    ```

2. Create your `home_resource.ts` file.

    ```typescript
    import { Drash } from "https://deno.land/x/drash@v1.3.0/mod.ts";

    export class HomeResource extends Drash.Http.Resource {

      static paths = ["/"];

      public async GET() {
        this.response.body = await this.response.render(
          "./index",
          {
            message: "Hella using Eta.",
            template_engines: [
              {
                name: "dejs",
                url: "https://github.com/syumai/dejs",
              },
              {
                name: "Dinja",
                url: "https://github.com/denjucks/dinja",
              },
              {
                name: "Jae",
                url: "https://github.com/drashland/deno-drash-middleware",
              }
            ],
          }
        );

        return this.response;
      }
    }
    ```

3. Create your `index.eta` file.

    ```html
    <!DOCTYPE html>
    <html class="h-full w-full">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, user-scalable=no"/>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">
        <title>Tengine</title>
      </head>
      <body style="background: #f4f4f4">
        <div style="max-width: 640px; margin: 50px auto;">
          <h1 class="text-5xl mb-5"><%= it.message %></h1>
          <p class="mb-5">Eta is a template engine. Some other template engines are:</p>
          <ul class="list-disc ml-5">
            <% for (const index in it.template_engines) { %>
              <li>
                <span class="text-bold"><%= it.template_engines[index].name %>: </span>
                <a href="<%= it.template_engines[index].url %>" target="_BLANK"><%= it.template_engines[index].url %></a>
              </li>
            <% } %>
          </ul>
        </div>
      </body>
    </html>
    ```

### Eta: Verification

1. Run your `app.ts` file.

    ```
    deno run --allow-net --allow-read --unstable app.ts
    ```

2. Navigate to `localhost:1447` in your browser. You should see an HTML page with the following text:

   ```text
   Hella using Eta.
   ```
