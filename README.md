[![GitHub release](https://img.shields.io/github/release/crookse/deno-drash.svg?color=bright_green&label=latest)](https://github.com/crookse/deno-drash/releases)
[![Travis (.org) branch](https://img.shields.io/travis/crookse/deno-drash.svg)](https://travis-ci.org/crookse/deno-drash)
[![deno version](https://img.shields.io/badge/requires%20deno-v0.3.7-brightgreen.svg)](https://github.com/denoland/deno_install)
[![deno_std version](https://img.shields.io/badge/uses%20deno__std-v0.3.4-brightgreen.svg)](https://github.com/denoland/deno_std)

# Drash

Drash is a microframework for [Deno](https://deno.land) based on [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web) and [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation).

Drash is designed to help you build your project(s) quickly with the ability to scale. You can build an API, a SaaS, a web app, an SPA (like the [documentation pages](https://crookse.github.io/deno-drash/#/)), or even a static HTML site. You can even just use it as a logging tool for your other project. How you use Drash is up to you, so that it can be everything you need and nothing you don't.

Although this module is working, it is still subject to breaking changes from Deno. For the most part, Drash stays up to date with breaking changes from Deno, but not all breaking changes are fixed immediately.

* [View documentation](https://crookse.github.io/deno-drash/#/)
* [Report a bug](https://github.com/crookse/deno-drash/issues/new/choose)
* [Request a feature](https://github.com/crookse/deno-drash/issues/new/choose)

## Install

```typescript
// Import Drash latest release
import Drash from "https://deno.land/x/drash@v0.8.0/mod.ts";

// Import Drash master
import Drash from "https://deno.land/x/drash/mod.ts";
```

_It is recommended that you import the latest release or a specific release to prevent breaking changes. Drash's master branch tries to keep up with the latest Deno code (including deno_std) and is subject to Deno's "disruptive renames."_

## Quickstart

**Create `/path/to/your/project/app.ts` ...**

```typescript
import Drash from "https://deno.land/x/drash@v0.8.0/mod.ts";

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

**... and run `/path/to/your/project/app.ts`**

```shell
$ deno /path/to/your/project/app.ts --allow-net --allow-env

Deno server started at localhost:8000. Press CTRL+C to quit.
```

## Features

**HTTP Resources**

Drash uses [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web). It doesn't use controllers and it doesn't use `app.get('/', someHandler())`-like syntax. You create a resource class, define its URIs, and give it HTTP methods (e.g., `GET()`, `POST()`, `PUT()`, `DELETE()`, etc.).

**Content Negotiation**

Drash is based on resources and you can't have true resources unless clients can request different representations of those resources through content negotiation. Out of the box, Drash's `Drash.Http.Response` class can generate the following representations for resources: `application/json`, `text/html`, `application/xml`, and `text/xml`. Getting the `Drash.Http.Response` class to handle more representations is easy. Read the [Adding Content Types](https://crookse.github.io/deno-drash/#/tutorials/adding-content-types) tutorial for more information.

**Request Path Params (e.g., `/users/:id`)**

Resources can access their URI's path params via `this.request.path_params.some_param`--allowing you to build RESTful/ish APIs.

**Request URL Query Params (e.g., `/users?id=1234`)**

Resources can access the request's URL query params via `this.request.url_query_params.some_param`.

**Request Body (e.g., `{"id":"1234"}`)**

Resources can access the request's body via `this.request.body_parsed.some_param`. Supported content types are `application/json` and `application/x-www-form-urlencoded`.

**Semantic Method Names**

If you want your resource class to allow `GET` requests, then give it a `GET()` method. If you want your resource class to allow `POST` requests, then give it a `POST()` method. If you don't want your resource class to allow `DELETE` requests, then don't give your resource class a `DELETE()` method. Pretty simple ideology and very semantic.
