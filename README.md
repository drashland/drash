<p align="center">
  <a href="https://crookse.github.io/deno-drash">
    <img height="200" src="https://crookse.github.io/deno-drash/public/assets/img/logo_drash_github.png" alt="Drash logo">
  </a>
</p>
<p align="center">A microframework for <a href="https://github.com/denoland/deno">Deno</a> focused on <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web">resource</a> creation and <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation">content negotiation</a>.</p>
<p align="center">
  <a href="https://github.com/crookse/deno-drash/releases">
    <img src="https://img.shields.io/github/release/crookse/deno-drash.svg?color=bright_green&label=latest">
  </a>
  <a href="https://travis-ci.org/crookse/deno-drash">
    <img src="https://travis-ci.org/crookse/deno-drash.svg?branch=master">
  </a>
  <a href="https://github.com/denoland/deno">
    <img src="https://img.shields.io/badge/requires%20deno-v0.22.0-brightgreen.svg">
  </a>
  <a href="https://github.com/denoland/deno_std">
    <img src="https://img.shields.io/badge/uses%20deno__std-v0.20.0-brightgreen.svg">
  </a>
</p>

---

```typescript
// File: app.ts

import Drash from "https://deno.land/x/drash@v0.22.2/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "Hello World!";
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:1337",
  response_output: "text/html",
  resources: [HomeResource]
});

server.run();
```

```
$ deno --allow-net --allow-env app.ts
```

For a more complicated application, try out the [Hello World](https://crookse.github.io/deno-drash/#/tutorials/creating-an-app-hello-world-part-1) tutorial series!

## Documentation

For full documentation, visit [https://drash.io](https://crookse.github.io/deno-drash/).

## Features

- HTTP Resources
- Content Negotiation
- Static Path Routing
- Request Path Params Parsing
    - `/users/:id`
    - `/users/{id}`
    - `/users/([0-9]+)`
- Request URL Query Params Parsing
    - `/products?name=beignet&action=purchase`
- Request Body Parsing
    - application/x-www-form-urlencoded (e.g, `username=root&password=alpine`)
    - application/json (e.g., `{"username":"root","password":"alpine"}`)
