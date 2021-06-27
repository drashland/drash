# Creating A Template

## Table of Contents

- [Before You Get Started](#before-you-get-started)
- [Folder Structure End State](#folder-structure-end-state)
- [Steps](#steps)
- [Verification](#verification)

## Before You Get Started

In this tutorial, you will create an HTML template with a `<% user.name %>`
template variable.

## Folder Structure End State

Upon completing the Steps section below, your project's folder structure should
look similar to the following:

```
▾ /path/to/your/project/
  ▾ /views
    user.html
  app.ts
  user_resource.ts
```

## Steps

1. Create your template file.

   Filename: `/path/to/your/project/views/user.html`

   ```html
   <!DOCTYPE html>
   <html class="h-full w-full">
     <head>
       <meta charset="utf-8"/>
       <meta name="viewport" content="width=device-width, minimum-scale=1.0, user-scalable=no"/>
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">
       <title>User Profile</title>
     </head>
     <body style="background: #f4f4f4">
       <div style="max-width: 640px; margin: 50px auto;">
         <h1 class="text-5xl"><% user.name %></h1>
       </div>
     </body>
   </html>
   ```

2. Create your resource file.

   Filename: `/path/to/your/project/user_resource.ts`

   ```typescript
   import { Drash } from "https://deno.land/x/drash@v1.4.4/mod.ts";

   export class UserResource extends Drash.Http.Resource {
     static paths = ["/user"];

     public GET() {
       this.response.body = this.response.render(
         "/user.html", // Leading slash is required here
         {
           user: {
             name: "Captain America",
           },
         },
       );

       return this.response;
     }
   }
   ```

3. Create your app file.

   Filename: `/path/to/your/project/app.ts`

   ```typescript
   import { Drash } from "https://deno.land/x/drash@v1.4.4/mod.ts";
   import { Tengine } from "https://deno.land/x/drash_middleware@v0.7.7/tengine/mod.ts";
   import { UserResource } from "./user_resource.ts";

   // Configure Tengine
   const tengine = Tengine({
     render: (...args: unknown[]): boolean => {
       return false;
     },
     views_path: "./path/to/your/project/views", // DO NOT include a trailing slash
   });

   const server = new Drash.Http.Server({
     middleware: {
       after_resource: [
         tengine,
       ],
     },
     resources: [
       UserResource,
     ],
     response_output: "text/html",
   });

   server.run({
     hostname: "localhost",
     port: 1447,
   });
   ```

## Verification

You can verify that your app's code works by making requests like the ones
below. Since this tutorial's app sets `text/html` as the `response_output`, the
server responds to requests with HTML by default.

1. Run your app.

   ```shell
   $ deno run --allow-net --allow-read app.ts
   ```

2. Go to `localhost:1447/user` in your browser. You should receive the following
   response:

   ![Creating A Template](./img/creating_a_template.png)

---

Other tutorials: [Extending A Template](./extending_a_template.md) |
[Adding Template Partials](./adding_template_partials.md) |
[In-Template JavaScript](./in_template_javascript.md)
