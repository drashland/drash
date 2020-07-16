# Dexter

Armor helps secure your Drash applications through headers. Inspired by [helmet](https://github.com/helmetjs/helmet). It is configurable and can be used throughout the request-resource-response lifecycle.

Armor will set extra HTTP headers to the request response, to aid in securing your application. This does not make your application bulletproof, but adds extra security layers.

```typescript
import { Drash } from "https://deno.land/x/drash@{version}/mod.ts";

// Import the Armor middleware function
import { Armor } from "https://deno.land/x/drash-middleware@{version}/armor/mod.ts";

// Instantiate armor
const armor = Armor();

// Create your server and plug in armor to the middleware config
const server = new Drash.Http.Server({
  resources: [
    HomeResource,
  ],
  middleware: {
    after_request: [
      armor
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

Armor has a list of default headers it will set, when `Armor` is called with no arguments, but you can override these.

### `X-XSS-Protection`

This header does not protect against XSS attacks, but only protects against *one type* of XSS attack.

See here for more information: https://helmetjs.github.io/docs/xss-filter/

- [x] Enabled by default?

```typescript
const armor = Armor() // Set by default
const armor = Armor({
  "X-XSS-Protection": false // Disable it
})
```

### `Referrer-Policy`

The Referrer-Policy header is usually set by browsers to tell a server where it's coming from.

See here for more information: https://helmetjs.github.io/docs/referrer-policy/

- [ ] Enabled by default?

```typescript
const armor = Armor() // Will not set the header
const armor = Armor({
  "Referrer-Policy": "no-origin" // Enable it, and set it to "no-origin"
})
```

See [here](https://www.w3.org/TR/referrer-policy/#referrer-policies) for all possible policies.

### `X-Content-Type-Options`

The Referrer-Policy header is used to tell browsers not to sniff the mime type. Browsers will trust what the server says and block the resource if it’s wrong.

See here for more information: https://helmetjs.github.io/docs/dont-sniff-mimetype/

- [x] Enabled by default?

```typescript
const armor = Armor() // Set by default
const armor = Armor({
  "X-Content-Type-Options": false // Disable it
})
```

### `Strict-Transport-Security`

The Strict-Transport-Security (HSTS) header is used to tell browsers to stick with HTTPS and never visit the HTTP version.

See here for more information: https://helmetjs.github.io/docs/hsts/

- [x] Enabled by default?

```typescript
const armor = Armor() // Set by default to 60 days and include sub domains
const armor = Armor({
  hsts: {
    maxAge: false // Disable the header altogether
  }
})
const armor = Armor({
  hsts: {
    maxAge: 5184000 // Enable HSTS and set a max age
  }
})
const armor = Armor({
  hsts: {
    includeSubDomains: false // Enable default max age but disable the inclusion of sub domains
  }
})
const armor = Armor({
  hsts: {
    includeSubDomains: true // Can set to true, but it's set by default
  }
})
const armor = Armor({
  hsts: {
    preload: true // Defaults to false
  }
})
```

### `X-Powered-By`

The X-Powered-By header is used to show which techonology powers the  server.  Removing this reduces vulnerabilities because a hacker won't be able to use this against you.

See here for more information: https://helmetjs.github.io/docs/hide-powered-by/

- [x] Enabled by default?

```typescript
const armor = Armor() // Removed the header by default
const armor = Armor({
  "X-Powered-By": false // Also removes it
})
const armor = Armor({
  "X-Powered-By": true // Keeps the header
})
```

### `X-Frame-Options`

The X-Frame-Options header is used to mitigate clickjacking attacks.

See here for more information: https://helmetjs.github.io/docs/hide-powered-by/

- [x] Enabled by default?

```typescript
const armor = Armor() // Defaults to "sameorigin". Allows you to put iFrames on your page.
const armor = Armor({
  "X-Frame-Options": false // Will not set the header
})
const armor = Armor({
  "X-Frame-Options": "DENY" // Sets the header to "DENY". Prevent any iFrames.
})
const armor = Armor({
  "X-Frame-Options": "ALLOW-FROM https://example.com" // Allows example.com to embed an iFrame on the page.
})
```

### `Expect-CT`

The Expect-CT header tells browsers to expect Certificate Transparency

See here for more information: https://helmetjs.github.io/docs/expect-ct/

- [ ] Enabled by default?

```typescript
const armor = Armor() // Does not set the header
const armor = Armor({
  expectCt: {
    maxAge: 30 // Sets the header and the age to 60 days
  }
})
const armor = Armor({
  expectCt: {
    maxAge: 30,
    enforce: true // Sets enforce: "Expect-CT: max-age=30; enforce"
  }
})
const armor = Armor({
  expectCt: {
    maxAge: 30,
    enforce: true,
    reportUri: "http://example.com/report" // Expect-CT: enforce; max-age=30; report-uri="http://example.com/report"
  }
})
```

### `X-DNS-Prefetch-Control`

The X-DNS-Prefetch-Control header lets you disable browsers’ DNS prefetching

See here for more information: https://helmetjs.github.io/docs/dns-prefetch-control/

- [ ] Enabled by default?

```typescript
const armor = Armor() // off
const armor = Armor({
  "X-DNS-Prefetch-Control": false // off
})
const armor = Armor({
  "X-DNS-Prefetch-Control": true // on
})
```
