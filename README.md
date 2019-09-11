<p align="center">
  <a href="https://crookse.github.io/deno-drash">
    <img height="200" src="https://crookse.github.io/deno-drash/public/assets/img/logo_drash_github.png" alt="Drash logo">
  </a>
</p>
<p align="center">A microframework for <a href="https://github.com/denoland/deno">Deno</a> based on <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web">HTTP resources</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation">content negotiation</a>.</p>
<p align="center">
  <a href="https://github.com/crookse/deno-drash/releases">
    <img src="https://img.shields.io/github/release/crookse/deno-drash.svg?color=bright_green&label=latest">
  </a>
  <a href="https://travis-ci.org/crookse/deno-drash">
    <img src="https://travis-ci.org/crookse/deno-drash.svg?branch=master">
  </a>
  <a href="https://github.com/denoland/deno">
    <img src="https://img.shields.io/badge/requires%20deno-v0.16.0-brightgreen.svg">
  </a>
  <a href="https://github.com/denoland/deno_std">
    <img src="https://img.shields.io/badge/uses%20deno__std-v0.16.0-brightgreen.svg">
  </a>
</p>

---

```typescript
// File: app.ts

import Drash from "https://deno.land/x/drash@v0.16.2/mod.ts";

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

- [x] HTTP Resources
- [x] Content Negotiation
- [x] Static Paths
- [x] Request Path Params (e.g., `/users/:id`)
- [x] Request URL Query Params (e.g., `/users?id=1234`)
- [x] Request Body (e.g., `{"id":"1234"}`)
