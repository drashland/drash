# Adding Template Partials

## Table of Contents

- [Before You Get Started](#before-you-get-started)
- [Folder Structure End State](#folder-structure-end-state)
- [Steps](#steps)
- [Verification](#verification)

## Before You Get Started

In this tutorial, you will create an HTML template with template partials using
`<% include_partial("/skills.html") %>`.

## Folder Structure End State

Upon completing the Steps section below, your project's folder structure should
look similar to the following:

```
▾ /path/to/your/project/
  ▾ /views
    skills.html
    user.html
  app.ts
  user_resource.ts
```

## Steps

1. Create your template file that will include the template partial. _Note: The
   `skills.html` file must be relative to the `views_path` config._

   Filename: `/path/to/your/project/views/user.html`

   ```html
   <!DOCTYPE html>
   <html class="h-full w-full">
     <head>
       <meta charset="utf-8"/>
       <meta name="viewport" content="width=device-width, minimum-scale=1.0, user-scalable=no"/>
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">
       <title>Skills</title>
     </head>
     <body style="background: #f4f4f4">
       <div style="max-width: 640px; margin: 50px auto;">
         <h1 class="text-5xl"><% user.name %></h1>
         <h2 class="text-4xl mt-4">Skills</h2>
         <% include_partial("/skills.html") %>
       </div>
     </body>
   </html>
   ```

2. Create your template partial file.

   Filename: `/path/to/your/project/views/skills.html`

   ```html
   <ul>
     <li>Agility</li>
     <li>Strength</li>
     <li>Endurance</li>
   </ul>
   ```

3. Create your resource file.

   Filename: `/path/to/your/project/user_resource.ts`

   ```typescript
   import { Drash } from "https://deno.land/x/drash@v1.4.2/mod.ts";

   export default class UserResource extends Drash.Http.Resource {
     static paths = ["/user"];

     public GET() {
       this.response.body = this.response.render(
         "/user.html",
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

4. Create your app file.

   Filename: `/path/to/your/project/app.ts`

   ```typescript
   import { Drash } from "https://deno.land/x/drash@v1.4.2/mod.ts";
   import { Tengine } from "https://deno.land/x/drash_middleware@v0.7.5/tengine/mod.ts";
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

   ![Adding Template Partials](./img/adding_template_partials.png)

---

Other tutorials: [Creating A Template](./creating_a_template.md) |
[Extending A Template](./extending_a_template.md) |
[In-Template JavaScript](./in_template_javascript.md)
