# Morgan

Morgan is a logging middleware similar to [expressjs/morgan](https://github.com/expressjs/morgan). It is configurable and can be used throughout the request-resource-response lifecycle.

```typescript
import { Drash } from "https://deno.land/x/drash@{version}/mod.ts";

// Import the Morgan middleware function
import { Morgan } from "https://deno.land/x/drash-middleware@v0.1.0oh s/morgan/mod.ts";

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

`enabled`

Enable or disable the logger from logging based on the value of this config.

```typescript
const morgan = Morgan({
  enabled: true, // or false
});
```

`level`

Define what log statements should be written based on their log level definition (e.g., debug, info, warn).

```typescript
const morgan = Morgan({
  enabled: true,
  level: "debug", // or all, trace, debug, info, warn, error, fatal, off
});
```

`tag_string`

Define the display of the log statements' tag string. The tag string is a concatenation of tokens preceding the log message. Avaiable, predefined tags:

* `{level}`
* `{method}
* `{url}`

```typescript
const morgan = Morgan({
  enabled: true,
  tag_string: "{level} | {method} {url} |" // Will output something similar to "INFO | GET /home | The log message."
});
```

`tag_string_fns`

If you want more customizations with the `tag_string` config, then you can use `tag_string_fns` to define what your tags should resolve to.

```typescript
const morgan = Morgan({
  enabled: true,
  tag_string: "{datetime} |",
  tag_string_fns: {
    datetime() {
      return new Date().toISOString().replace("T", " ").split(".")[0];
    },
  }
});
```

## Tutorials

### Reusing Morgan in resource classes (or other parts of your codebase)

You can reuse Morgan in your codebase by accessing its `logger` from its prototypes. For example, if you want to use Morgan in one of your resources, then do the following:

```typescript
// File: app.ts


```
