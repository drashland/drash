# Morgan

Morgan is a logging middleware similar to [expressjs/morgan](https://github.com/expressjs/morgan). It is configurable and can be used throughout the request-resource-response lifecycle.

```typescript
import { Drash } from "https://deno.land/x/drash@{version}/mod.ts";

// Import the Morgan middleware function
import { Morgan } from "https://deno.land/x/drash-middleware@{version}/morgan/mod.ts";

// Instantiate morgan
const morgan = Morgan();

// Create your server and plug in morgan to the middleware config
const server = new Drash.Http.Server({
  resources: [
    HomeResource,
  ],
  middleware: {
    before_request: [
      morgan
    ],
    after_request: [
      morgan
    ]
  }
});

server.run({
  hostname: "localhost",
  port: 1447,
});

console.log(`Server running at ${server.hostname}:${server.port}`);
```

## Configuration

If you decide to configure Morgan, make sure you specify the `enabled` flag in the configs as it is required when customizing the configuration.

### `enabled`

Enable or disable the logger from logging based on the value of this config.

```typescript
const morgan = Morgan({
  enabled: true, // or false
});
```

### `level`

Define what log statements should be written based on their log level definition (e.g., debug, info, warn).

```typescript
const morgan = Morgan({
  enabled: true,
  level: "debug", // or all, trace, debug, info, warn, error, fatal, off
});
```

### `tag_string`

Define the display of the log statements' tag string. The tag string is a concatenation of tokens preceding the log message. Avaiable, predefined tags:

* `{level}`
* `{request_method}
* `{request_url}`

```typescript
const morgan = Morgan({
  enabled: true,
  tag_string: "{level} | {request_method} {request_url} |" // Will output something similar to "INFO | GET /home | The log message."
});
```

### `tag_string_fns`

If you want more customizations with the `tag_string` config, then you can use `tag_string_fns` to define what your tags should resolve to.

```typescript
const morgan = Morgan({
  enabled: true,
  tag_string: "{datetime} | {my_tag} |", // Will output something similar to "2020-07-12 10:32:14 | TIGERRR | The log message."
  tag_string_fns: {
    datetime() {
      return new Date().toISOString().replace("T", " ").split(".")[0];
    },
    my_tag: "TIGERRR"
  }
});
```

### `response_time`

If you want to see how fast your responses are taking, then use this config. This config will output something similar to `Response sent. 2 ms`.

```typescript
const morgan = Morgan({
  enabled: true,
  response_time: true, // or false
});
```

## Tutorials

### Reusing Morgan in resource classes (or other parts of your codebase)

You can reuse Morgan in your codebase by accessing its `logger` from its prototypes. For example, if you want to use Morgan in one of your resources, then do the following:

1. Create your `app.ts` file.

    ```typescript
    // File: app.ts
    import { Drash } from "https://deno.land/x/drash@{version}/mod.ts";
    import { HomeResource } from "./home_resource.ts";
    import { Morgan } from "https://deno.land/x/drash-middleware@{version}/morgan.ts";
    
    const morgan = Morgan({
      enabled: true,
      level: "debug",
      tag_string: "{request_method} {request_url} |",
    });
    
    // Export Morgan after it has been instantiated with configurations
    export { Morgan };
    
    const server = new Drash.Http.Server({
      resources: [
        HomeResource,
      ],
      middleware: {
        before_request: [
          morgan
        ],
        after_request: [
          morgan
        ]
      }
    });
    
    server.run({
      hostname: "localhost",
      port: 1447,
    });
    
    console.log(`Server running at ${server.hostname}:${server.port}`);
    ```
    
2. Create your `home_resource` file.

    ```typescript
    import { Drash } from "https://deno.land/x/drash@v1.0.7/mod.ts";
    import { Morgan } from "./app.ts";
    
    export class HomeResource extends Drash.Http.Resource {
    
      static paths = ["/"];
    
      public GET() {
    
        // Access Morgan's logger from it's prototype and log some messages
        Morgan.prototype.logger.debug("This is a log message.");
        Morgan.prototype.logger.error("This is a log message.");
        Morgan.prototype.logger.fatal("This is a log message.");
        Morgan.prototype.logger.info("This is a log message.");
        Morgan.prototype.logger.trace("This is a log message.");
        Morgan.prototype.logger.warn("This is a log message.");
    
        this.response.body = "GET request received!";
    
        return this.response;
      }
    }
    ```
