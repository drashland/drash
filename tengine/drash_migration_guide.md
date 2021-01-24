# `Drash.Compilers.TemplateEngine` Migration Guide

If you have received the message about `server.template_engine` being deprecated
and are looking for the migration guide, click
[here](./drash_migration_guide.md).

1. Remove the following from your
   `const server = new Drash.Http.Server({ ... })` block:
   - `views_path`
   - `template_engine`
2. Import Tengine into your application where you are creating your server.
   ```typescript
   import { Tengine } from "https://deno.land/x/drash_middleware@v0.6.1/tengine/mod.ts";
   ```
3. Configure Tengine.
   ```typescript
   const tengine = Tengine({
     render: (...args: unknown[]): boolean => {
       return false; // This render method returns false to tell Tengine to use its default template engine
     },
     views_path: "./path/to/your/views",
   });
   ```
4. Add Tengine to your server's middleware configs.
   ```typescript
   const server = new Drash.Http.Server({
     ...
     middleware: {
       after_resource: [
         tengine
       ]
     }
     ...
   });
   ```
5. You are all set!
