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
  <a href="https://github.com/denoland/deno_install">
    <img src="https://img.shields.io/badge/requires%20deno-%3E=0.3.7%20%3C=0.9.0-brightgreen.svg">
  </a>
  <a href="https://github.com/denoland/deno_std">
    <img src="https://img.shields.io/badge/uses%20deno__std-v0.9.0-brightgreen.svg">
  </a>
</p>

---

Drash is designed to help you build your projects quickly with the ability to scale. You can build an API, a SaaS, a web app, an SPA, or even a static HTML site. How you use Drash is up to you, so that it can be everything you need and nothing you don't--like a DRASH tent.

For full documentation, visit [https://drash.io](https://drash.io).

## Features

- [x] HTTP Resources
- [x] Content Negotiation
- [x] Static Paths
- [x] Request Path Params (e.g., `/users/:id`)
- [x] Request URL Query Params (e.g., `/users?id=1234`)
- [x] Request Body (e.g., `{"id":"1234"}`)

## Importing

```typescript
// Import Drash latest release
import Drash from "https://deno.land/x/drash@v0.8.6/mod.ts";

// Import Drash master
import Drash from "https://deno.land/x/drash/mod.ts";
```

_It is recommended that you import the latest release or a specific release to prevent breaking changes. Drash's master branch tries to keep up with the latest Deno code (including [deno_std](https://github.com/denoland/deno_std)) and is subject to Deno's "disruptive renames" as stated in deno_std._

## Quickstart

**Create `app.ts` ...**

```typescript
import Drash from "https://deno.land/x/drash@v0.8.6/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "Hello World!";
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource]
});

server.run();
```

**... and run `app.ts`**

```shell
$ deno --allow-net --allow-env app.ts

Deno server started at localhost:8000. Press CTRL+C to quit.
```

For a more complicated application, try out the [Hello World](https://crookse.github.io/deno-drash/#/tutorials/creating-an-app-hello-world-part-1) tutorial series!
