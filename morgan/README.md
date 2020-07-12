```typescript
import { Drash } from "https://deno.land/x/drash@{version}/mod.ts";
// Import the Morgan middleware function
import { Morgan } from "https://deno.land/x/drash-middleware/morgan/mod.ts";

// Configure morgan
const morganLogger = MorganLogger({
  enabled: true,
  level: "debug"
});

// Plug in morgan to the middleware config
const server = new Drash.Http.Server({
  resources: [
    HomeResource,
  ],
  middleware: {
    before_request: [
      morganLogger
    ],
    after_request: [
      morganLogger
    ]
  }
});

server.run({
  hostname: "localhost",
  port: 1447,
});

console.log(`Server running at ${server.hostname}:${server.port}`);
```
