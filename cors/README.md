# Cors

Cors is a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) HTTP-based middleware inspired by [expressjs/cors](https://expressjs.com/en/resources/middleware/cors.html). It can be simply placed as a middleware on your server and you're all set!

## Table of Contents

* [Usage](#usage)
* [Configuration](#configuration)
* [Tutorial: Enabling CORS](#tutorial-enabling-cors)

## Usage

```ts
import { Drash } from "https://deno.land/x/drash@v1.3.1/mod.ts";
import { Cors } from "https://deno.land/x/drash-middleware@v0.6.1/cors/mod.ts";

const server = new Drash.Http.Server({
  middleware: {
    after_request: [
      Cors(),
    ]
  },
});
```

## Configuration

You can use it as is without passing any options (using the default options the middleware will set), or you can configure it as explained below. Passing no options will allow CORS for any requests to your server from any origin.

`Cors` can be configured by passing in an object, for example: `Cors({ ... })`. Below are supported options:

### `origin`

The `origin` property configures the `Access-Control-Allow-Origin` header. This option tells the middleware what origins to allow requests from. For example, if the value is `"https://google.com"`, then the middleware will not allow requests from `"https://stackoverflow.com"`.

The `origin` can be of type:
  - `boolean` - set `origin` to `true` to reflect the [request origin](http://tools.ietf.org/html/draft-abarth-origin-09), or set it to `false` to disable CORS.
  - `string` - set `origin` to a specific origin. For example if you set it to `"http://example.com"` only requests from "http://example.com" will be allowed.
  - `RegExp` - set `origin` to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern `/example\.com$/` will reflect any request that is coming from an origin ending with "example.com".
  - `array` - set `origin` to an array of valid origins. Each origin can be a `string` or a `RegExp`. For example `["http://example1.com", /\.example2\.com$/]` will accept any request from "http://example1.com" or from a subdomain of "example2.com".
  - `Function` - set `origin` to a function implementing some custom logic. The function takes the request origin as the first parameter and a callback as a second (which expects the signature `err [Error | null], allow [bool]`), *async-await* and promises are supported as well.

### `methods`

Configures the **Access-Control-Allow-Methods** CORS header. Expects a comma-delimited string (ex: `"GET,PUT,POST"`) or an array (ex: `['GET', 'PUT', 'POST']`).

### `allowedHeaders`

Configures the **Access-Control-Allow-Headers** CORS header. Expects a comma-delimited string (ex: `"Content-Type,Authorization"`) or an array (ex: `['Content-Type', 'Authorization']`). If not specified, defaults to reflecting the headers specified in the request's **Access-Control-Request-Headers** header.

### `exposedHeaders`

Configures the **Access-Control-Expose-Headers** CORS header. Expects a comma-delimited string (ex: `'Content-Range,X-Content-Range'`) or an array (ex: `['Content-Range', 'X-Content-Range']`). If not specified, no custom headers are exposed.

### `credentials`

Configures the **Access-Control-Allow-Credentials** CORS header. Set to `true` to pass the header, otherwise it is omitted.

### `maxAge`

Configures the **Access-Control-Max-Age** CORS header. Set to an integer to pass the header, otherwise it is omitted.

### `optionsSuccessStatus`

Provides a status code to use for successful `OPTIONS` requests, since some legacy browsers (IE11, various SmartTVs) choke on `204`.

### `preflight`

If needed you can entirely disable preflight by passing `false` here (default: `true`).
