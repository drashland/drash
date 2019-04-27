[![GitHub release](https://img.shields.io/github/release/crookse/deno-drash.svg?color=bright_green&label=latest)](https://github.com/crookse/deno-drash/releases)
[![Travis (.org) branch](https://img.shields.io/travis/crookse/deno-drash/v0.8.1.svg?label=master)](https://travis-ci.org/crookse/deno-drash)
[![deno version](https://img.shields.io/badge/requires%20deno-%3E=0.3.7%20%3C=0.3.10-brightgreen.svg)](https://github.com/denoland/deno_install)
[![deno_std version](https://img.shields.io/badge/uses%20deno__std-v0.3.4-brightgreen.svg)](https://github.com/denoland/deno_std)

# Drash

Drash is a microframework for [Deno](https://deno.land) based on [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web) and [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation).

Drash is designed to help you build your project(s) quickly with the ability to scale. You can build an API, a SaaS, a web app, an SPA (like the [documentation pages](https://crookse.github.io/deno-drash/#/)), or even a static HTML site. How you use Drash is up to you, so that it can be everything you need and nothing you don't.

* [View documentation](https://crookse.github.io/deno-drash/#/)
* [Report a bug](https://github.com/crookse/deno-drash/issues/new/choose)
* [Request a feature](https://github.com/crookse/deno-drash/issues/new/choose)

## Features

* Static Paths
* Request Path Param Parsing (e.g., `/users/:id`)
* Request URL Query Param Parsing (e.g., `/users?id=1234`)
* Request Body Parsing (e.g., `{"id":"1234"}`)
* Content Negotiation

[Learn more about the features here.](https://crookse.github.io/deno-drash/#/introduction#features)

## Install

```typescript
// Import Drash latest release
import Drash from "https://deno.land/x/drash@v0.8.2/mod.ts";

// Import Drash master
import Drash from "https://deno.land/x/drash/mod.ts";
```

_It is recommended that you import the latest release or a specific release to prevent breaking changes. Drash's master branch tries to keep up with the latest Deno code (including [deno_std](https://github.com/denoland/deno_std)) and is subject to Deno's "disruptive renames" as stated in deno_std._

## Quickstart

**Create `app.ts` ...**

```typescript
import Drash from "https://deno.land/x/drash@v0.8.2/mod.ts";

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
