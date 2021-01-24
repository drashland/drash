# Paladin

Paladin helps you secure your Drash applications by setting various HTTP
headers. Inspired by [helmet](https://github.com/helmetjs/helmet). It is
configurable and can be used throughout the request-resource-response lifecycle.
This does not make your application bulletproof, but adds extra security layers.

```typescript
import { Drash } from "https://deno.land/x/drash@v1.4.0/mod.ts";

// Import the Paladin middleware function
import { Paladin } from "https://deno.land/x/drash_middleware@v0.7.1/paladin/mod.ts";

// Instantiate paladin
const paladin = Paladin();

// Create your server and plug in paladin to the middleware config
const server = new Drash.Http.Server({
  resources: [
    HomeResource,
  ],
  middleware: {
    after_request: [
      paladin,
    ],
  },
});

server.run({
  hostname: "localhost",
  port: 1447,
});

console.log(`Server running at ${server.hostname}:${server.port}`);
```

## Configuration

Paladin has a list of default headers it will set, when `Paladin` is called with
no arguments, but you can override these.

### `X-XSS-Protection`

This header does not protect against XSS attacks, but only protects against _one
type_ of XSS attack.

See here for more information: https://helmetjs.github.io/docs/xss-filter/

- [x] Enabled by default?

```typescript
const paladin = Paladin(); // Set by default
const paladin = Paladin({
  "X-XSS-Protection": false, // Disable it
});
const paladin = Paladin({
  "X-XSS-Protection": true, // Explicitly enable it
});
```

### `Referrer-Policy`

The Referrer-Policy header is usually set by browsers to tell a server where
it's coming from.

See here for more information: https://helmetjs.github.io/docs/referrer-policy/

- [ ] Enabled by default?

```typescript
const paladin = Paladin(); // Will not set the header
const paladin = Paladin({
  "Referrer-Policy": "origin", // Enable it, and set it to "origin"
});
```

See [here](https://www.w3.org/TR/referrer-policy/#referrer-policies) for all
possible policies.

### `X-Content-Type-Options`

The Referrer-Policy header is used to tell browsers not to sniff the
[MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
type. Browsers will trust what the server says and block the resource if it’s
wrong.

See here for more information:
https://helmetjs.github.io/docs/dont-sniff-mimetype/

- [x] Enabled by default?

```typescript
const paladin = Paladin(); // Set by default
const paladin = Paladin({
  "X-Content-Type-Options": false, // Disable it
});
const paladin = Paladin({
  "X-Content-Type-Options": true, // Explicitly enable it
});
```

### `Strict-Transport-Security`

The Strict-Transport-Security (HSTS) header is used to tell browsers to stick
with HTTPS and never visit the HTTP version.

See here for more information: https://helmetjs.github.io/docs/hsts/

- [x] Enabled by default?

```typescript
const paladin = Paladin(); // Set by default to 60 days and include sub domains
const paladin = Paladin({
  hsts: {
    max_age: false, // Disable the header altogether
  },
});
const paladin = Paladin({
  hsts: {
    max_age: 5184000, // Enable HSTS and set a max age
  },
});
const paladin = Paladin({
  hsts: {
    include_sub_domains: false, // Enable default max age but disable the inclusion of sub domains
  },
});
const paladin = Paladin({
  hsts: {
    include_sub_domains: true, // Can set to true, but it's set by default
  },
});
const paladin = Paladin({
  hsts: {
    preload: true, // Defaults to false
  },
});
```

### `X-Powered-By`

The X-Powered-By header is used to show which techonology powers the server.
Removing this reduces vulnerabilities because a hacker won't be able to use this
against you.

See here for more information: https://helmetjs.github.io/docs/hide-powered-by/

- [x] Removed by default?

```typescript
const paladin = Paladin(); // Removes the header by default
const paladin = Paladin({
  "X-Powered-By": false, // Also removes it
});
const paladin = Paladin({
  "X-Powered-By": true, // Will not remove the header
});
const paladin = Paladin({
  "X-Powered-By": "PHP 4.2.0", // Keep the header but lie, making it look your site is powered by PHP
});
```

Note: Drash by default, does not set the header explicitly.

### `X-Frame-Options`

The X-Frame-Options header is used to mitigate clickjacking attacks.

See here for more information: https://helmetjs.github.io/docs/hide-powered-by/

- [x] Enabled by default?

```typescript
const paladin = Paladin(); // Defaults to "sameorigin". Allows you to put iFrames on your page.
const paladin = Paladin({
  "X-Frame-Options": false, // Will not set the header
});
const paladin = Paladin({
  "X-Frame-Options": "DENY", // Sets the header to "DENY". Prevent any iFrames.
});
const paladin = Paladin({
  "X-Frame-Options": "ALLOW-FROM https://example.com", // Allows example.com to embed an iFrame on the page.
});
```

### `Expect-CT`

The Expect-CT header tells browsers to expect Certificate Transparency

See here for more information: https://helmetjs.github.io/docs/expect-ct/

- [ ] Enabled by default?

```typescript
const paladin = Paladin(); // Does not set the header
const paladin = Paladin({
  expect_ct: {
    max_age: 30, // Sets the header and the age to 60 days
  },
});
const paladin = Paladin({
  expect_ct: {
    max_age: 30,
    enforce: true, // Sets enforce: "Expect-CT: max-age=30; enforce"
  },
});
const paladin = Paladin({
  expect_ct: {
    max_age: 30,
    enforce: true,
    report_uri: "http://example.com/report", // Expect-CT: enforce; max-age=30; report-uri="http://example.com/report"
  },
});
```

### `X-DNS-Prefetch-Control`

The X-DNS-Prefetch-Control header lets you disable browsers’ DNS prefetching

See here for more information:
https://helmetjs.github.io/docs/dns-prefetch-control/

- [x] Enabled by default?

```typescript
const paladin = Paladin(); // off
const paladin = Paladin({
  "X-DNS-Prefetch-Control": false, // off
});
const paladin = Paladin({
  "X-DNS-Prefetch-Control": true, // on
});
```

### `Content-Security-Policy`

The X-DNS-Prefetch-Control header can help protect against malicious injection
of JavaScript, CSS, plugins, and more

See here for more information: https://helmetjs.github.io/docs/csp/

- [ ] Enabled by default?

```typescript
const paladin = Paladin(); // Does not set the header
const paladin = Paladin({
  "Content-Security-Policy": "default-src 'self'",
});
const paladin = Paladin({
  "Content-Security-Policy":
    "default-src 'self'; style-src 'self' maxcdn.bootstrapcdn.com",
});
```
