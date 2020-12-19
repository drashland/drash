# Cors

Cors is a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) HTTP-based middleware inspired by [expressjs/cors](https://expressjs.com/en/resources/middleware/cors.html). It can be simply placed as a middleware on your server and you're all set!

## Table of Contents

* [Usage](#usage)
* [Configuration](#configuration)

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

You can use `Cors` without passing in any options. If you do not pass in any options, then `Cors` will set its own default settings. Also, you should note that not passing in any options will enable CORS for all requests from any origin.

### `allowedHeaders`

This config is optional. This config manages the [`Access-Control-Allow-Headers` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers).

This config expects a `string` or `string[]` (e.g., `"Content-Type,Authorization"` or `["Content-Type", "Authorization"]`).

If this config is not specified, then it defaults to reflecting the values specified in the request's `Access-Control-Request-Headers` header.

### `credentials`

This config is optional. This config manages the [`Access-Control-Allow-Credentials` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials).

Set this config to `true` to send the header. Otherwise, it is omitted from the response.

### `exposedHeaders`

This config is optional. This config manages the [`Access-Control-Expose-Headers` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers).

This config expects a `string` or `string[]` (e.g., `"Content-Range,X-Content-Range"` or `["Content-Range", "X-Content-Range"]`).

If this config is not specified, then no custom headers are exposed.

### `origin`

This config is optional. This config manages the [`Access-Control-Allow-Origin` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin). This config tells `Cors` what origins to allow requests from. For example, if the value is `"https://google.com"`, then `Cors` will not allow requests from `"https://stackoverflow.com"`.

The `origin` config can be of the following types:
  * `RegExp`
      * Set `origin` to a regular expression to allow requests only from origins matching the regular expression. For example, the pattern `/example\.com$/` will match and allow any request that is coming from an origin ending with `example.com`.
  * `array`
      * Set `origin` to an array of valid origins. Each origin can be a `string` or a `RegExp`. For example, `["http://example1.com", /\.example2\.com$/]` will allow any request from `http://example1.com` and any request from a subdomain of `example2.com`.
  * `boolean`
      * Set `origin` to `true` to reflect the [request origin](http://tools.ietf.org/html/draft-abarth-origin-09), or set it to `false` to disable CORS.
  * `string`
      * Set `origin` to a single, specific origin. For example, set it to `"http://example.com"` to allow requests only from that origin.

### `methods`

This config is optional. This config manages the (`Access-Control-Allow-Methods` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods).

This config expects a `string` or `string[]` (e.g., `"GET,PUT,POST"` or `["GET", "PUT", "POST"]`).

### `maxAge`

This config is optional. This config manages the [`Access-Control-Max-Age` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age).

Set this config to an integer to send the header. Otherwise, it is omitted from the response.

### `optionsSuccessStatus`

This config is optional. This config provides a status code to use for successful `OPTIONS` requests, since some legacy browsers (e.g., IE11, various SmartTVs) choke on `204`.

### `preflight`

This config is optional. If needed, you can disable preflight entirely by setting this config to `false`.

If this config is not specified, then it defaults to `true`.
