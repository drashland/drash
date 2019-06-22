<p align="center">
  <img height="150" src="https://crookse.github.io/deno-drash/public/assets/img/logo_drash.png" alt="Drash logo">
</p>
<h1 align="center">Drash</h1>
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

# Drash

Drash is a microframework for [Deno](https://github.com/denoland/deno) based on [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web) and [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation).

Drash is designed to help you build your project(s) quickly with the ability to scale. You can build an API, a SaaS, a web app, an SPA (like the [documentation pages](https://crookse.github.io/deno-drash/#/)), or even a static HTML site. How you use Drash is up to you, so that it can be everything you need and nothing you don't.

* [View documentation](https://crookse.github.io/deno-drash/#/)
* [Report a bug](https://github.com/crookse/deno-drash/issues/new/choose)
* [Request a feature](https://github.com/crookse/deno-drash/issues/new/choose)

## Features

**HTTP Resources**

Drash uses [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web). It doesn't use controllers and it doesn't use `app.get('/', someHandler())`-like syntax. You create a resource class, define its URIs, and give it HTTP methods (e.g., `GET()`, `POST()`, `PUT()`, `DELETE()`, etc.).

**Static Paths**

Drash servers can handle requests for static assets like CSS files, JS files, and more. Depending on your use case (like building a web app with your own custom stylesheets and scripts), you might want to serve static assets. To do this, just include your list of static paths in the Drash server's `static_paths` config.

**Request Path Params (e.g., `/users/:id`)**

Resources can access their URI's path params via `this.request.path_params.some_param`--allowing you to build RESTful/ish APIs.

**Request URL Query Params (e.g., `/users?id=1234`)**

Resources can access the request's URL query params via `this.request.url_query_params.some_param`.

**Request Body (e.g., `{"id":"1234"}`)**

Resources can access the request's body via `this.request.body_parsed.some_param`. Supported content types are `application/json` and `application/x-www-form-urlencoded`.

**Semantic Method Names**

If you want your resource class to allow `GET` requests, then give it a `GET()` method. If you want your resource class to allow `POST` requests, then give it a `POST()` method. If you don't want your resource class to allow `DELETE` requests, then don't give your resource class a `DELETE()` method. Pretty simple ideology and very semantic.

**Content Negotiation**

Drash is based on resources and you can't have true resources unless clients can request different representations of those resources through content negotiation. Out of the box, Drash's `Drash.Http.Response` class can generate the following representations for resources: `application/json`, `text/html`, `application/xml`, and `text/xml`. Getting the `Drash.Http.Response` class to handle more representations is easy. Read the [Adding Content Types](https://crookse.github.io/deno-drash/#/tutorials/adding-content-types) tutorial for more information.

## Install

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

For a more complicated application, try out the Hello World tutorial series!

* [Drash - Creating An App: Hello World Part (1 of 4): Handling GET requests](https://crookse.github.io/deno-drash/#/tutorials/creating-an-app-hello-world-part-1)
* [Drash - Creating An App: Hello World Part (2 of 4): Building the front end](https://crookse.github.io/deno-drash/#/tutorials/creating-an-app-hello-world-part-2)
* [Drash - Creating An App: Hello World Part (3 of 4): Handling POST requests](https://crookse.github.io/deno-drash/#/tutorials/creating-an-app-hello-world-part-3)
* [Drash - Creating An App: Hello World Part (4 of 4): Logging](https://crookse.github.io/deno-drash/#/tutorials/creating-an-app-hello-world-part-4)
