# CSRF

CSRF is a [CSRF])https://en.wikipedia.org/wiki/Cross-site_request_forgery) protection middleware inspired by [expressjs/csurf](http://expressjs.com/en/resources/middleware/csurf.html). It can be simply placed as a middleware for your resources and you are all set!

```typescript
import { Drash } from "https://deno.land/x/drash@v{latest}/mod.ts";

// Import the Dexter middleware function
import { CSRF } from "https://deno.land/x/drash_middleware@v0.4.0/csrf/mod.ts";

// Instantiate csrf and generate the token
const csrf = CSRF();
// Alongside `csrf` being a middleware, you can access the token:
//     `console.log(csrf.token)`

// Create your server and resource, and plug in csrf to the middleware config
class Resource extends Drash.Http.Resource {
  public GET () {
  
  }
  
  @Drash.Http.Middleware({
    before_request: [csrf],
    after_request: []
  })
  public POST () {
    
  }
}
const server = new Drash.Http.Server({
  resources: [
    Resource,
  ],
});
server.run({
  hostname: "localhost",
  port: 1447,
});

console.log(`Server running at ${server.hostname}:${server.port}`);
```

## How Does It Work

CSRF will generate a cryptographically secure token, one that is made up from the following:

1. Generate a UUID
2. Generate a SHA512 hash
3. Updatethe SHA512 hash with the UUID

The result will look something like: `44c9e0a4817ca0f7644947a01cde1cae8ae30cc233352ca23baea8ed0123ca07c2528973419da4ffc4ae4b9c2c95707042ee8346c2ff2de5844ab3d5380b2e62`

## How to Use It

You can  access the token  by doing: `csrf.token`. You can pass this down to your views to use, and any resource methods with the CSRF middleware will require a `X-CSRF-TOKEN` header present.

If no header/token was passed in, Drash throws a 400.

If the request token  does not match what's in `csrf.token`, then Drash throws a 403.