# Cors

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Installation
Use the following import:

```ts
import { CorsMiddleware } from "https://deno.land/x/drash-middleware@v0.6.0/cors/mod.ts"; // If module is uploaded into deno.land
```

## Usage
Require cors middleware and register it as server-level middleware.

```ts
import { Drash } from "https://deno.land/x/drash@{version}/mod.ts";
import { CorsMiddleware } from "https://deno.land/x/drash-middleware@{version}/cors/mod.ts";

const server = new Drash.Http.Server({
  middleware: {
    after_request: [
      CorsMiddleware(),
    ]
  },
  resources: [
    HomeResource
  ],
  response_output: "application/json",
});
```

You can use it as is without passing any option, or you can configure it as explained below.
### Options
* `origin`: Configures the **Access-Control-Allow-Origin** CORS header. The value of origin could be of different types:
  - `Boolean` - set `origin` to `true` to reflect the [request origin](http://tools.ietf.org/html/draft-abarth-origin-09), or set it to `false` to disable CORS.
  - `String` - set `origin` to a specific origin. For example if you set it to `"http://example.com"` only requests from "http://example.com" will be allowed.
  - `RegExp` - set `origin` to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern `/example\.com$/` will reflect any request that is coming from an origin ending with "example.com".
  - `Array` - set `origin` to an array of valid origins. Each origin can be a `String` or a `RegExp`. For example `["http://example1.com", /\.example2\.com$/]` will accept any request from "http://example1.com" or from a subdomain of "example2.com".
  - `Function` - set `origin` to a function implementing some custom logic. The function takes the request origin as the first parameter and a callback as a second (which expects the signature `err [Error | null], allow [bool]`), *async-await* and promises are supported as well. Fastify instance is bound to function call and you may access via `this`. For example: 
  ```js
  origin: (request: Drash.Http.Request, response?: Drash.Http.Response) => {
    if(/localhost/.test(request.headers.get("Origin"))){
      //  Request from localhost will pass
      return true
    }

    return false  
  }
  ```
* `methods`: Configures the **Access-Control-Allow-Methods** CORS header. Expects a comma-delimited string (ex: 'GET,PUT,POST') or an array (ex: `['GET', 'PUT', 'POST']`).
* `allowedHeaders`: Configures the **Access-Control-Allow-Headers** CORS header. Expects a comma-delimited string (ex: `'Content-Type,Authorization'`) or an array (ex: `['Content-Type', 'Authorization']`). If not specified, defaults to reflecting the headers specified in the request's **Access-Control-Request-Headers** header.
* `exposedHeaders`: Configures the **Access-Control-Expose-Headers** CORS header. Expects a comma-delimited string (ex: `'Content-Range,X-Content-Range'`) or an array (ex: `['Content-Range', 'X-Content-Range']`). If not specified, no custom headers are exposed.
* `credentials`: Configures the **Access-Control-Allow-Credentials** CORS header. Set to `true` to pass the header, otherwise it is omitted.
* `maxAge`: Configures the **Access-Control-Max-Age** CORS header. Set to an integer to pass the header, otherwise it is omitted.
* `optionsSuccessStatus`: Provides a status code to use for successful `OPTIONS` requests, since some legacy browsers (IE11, various SmartTVs) choke on `204`.
* `preflight`: if needed you can entirely disable preflight by passing `false` here (default: `true`).

## License
By contributing your code, you agree to license your contribution under the [MIT License](./../LICENSE).
