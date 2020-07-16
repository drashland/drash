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


