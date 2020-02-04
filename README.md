<p align="center">
  <img height="200" src="https://drashland.github.io/deno-drash-docs/public/assets/img/logo_drash.png" alt="Drash logo">
  <h1 align="center">Drash</h1>
</p>
<p align="center">A REST microframework for <a href="https://github.com/denoland/deno">Deno</a>.</p>
<p align="center">
  <a href="https://github.com/drashland/deno-drash/releases">
    <img src="https://img.shields.io/github/release/drashland/deno-drash.svg?color=bright_green&label=latest">
  </a>
  <a href="https://github.com/drashland/deno-drash/actions">
    <img src="https://img.shields.io/github/workflow/status/drashland/deno-drash/master?label=master">
  </a>
</p>

---

```typescript
// File: app.ts

import Drash from "https://deno.land/x/drash/mod.ts";
// or import Drash from "https://deno.land/x/drash@{version}/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "Hello World! deno + Drash is cool!";
    return this.response;
  }
}

const server = new Drash.Http.Server({
  address: "localhost:1337",
  response_output: "text/html",
  resources: [HomeResource]
});

server.run();
```

```
$ deno --allow-net app.ts
```

```
$ curl -v localhost:1337
Hello World! deno + Drash is cool!
```

## Documentation

Full documentation: [https://drash.land](https://drash.land)

Repository: [deno-drash-docs](https://github.com/drashland/deno-drash-docs)

## Features

- <a href="http://drash.land/#/advanced-tutorials/content-negotiation/user-profiles" target="_BLANK">Content Negotiation</a>
- <a href="http://drash.land/#/tutorials/servers/serving-static-paths" target="_BLANK">Static Path Routing</a>
- <a href="http://drash.land/#/tutorials/resources/creating-a-resource#regular-expression-uris" target="_BLANK">Regex Path Routing</a>
- <a href="http://drash.land/#/tutorials/middleware/introduction" target="_BLANK">Middleware</a>
- <a href="http://drash.land/#/tutorials/requests/handling-application-json-bodies" target="_BLANK">Body Handling: application/json</a>
- <a href="http://drash.land/#/tutorials/requests/handling-application-x-www-form-urlencoded-bodies" target="_BLANK">Body Handling: application/x-www-form-urlencoded</a>
- <a href="http://drash.land/#/tutorials/requests/handling-multipart-form-data-bodies" target="_BLANK">Body Handling: multipart/form-data</a>
- <a href="http://drash.land/#/tutorials/requests/handling-path-params" target="_BLANK">Handling Path Params</a>
- <a href="http://drash.land/#/tutorials/requests/handling-url-query-params" target="_BLANK">Handling URL Query Params</a>

## Why Use Drash?

Drash takes concepts from the following:


* <a href="https://flask.palletsprojects.com/en/1.1.x/" target="_BLANK">Flask</a> &mdash; being <a href="https://flask.palletsprojects.com/en/1.1.x/foreword/#what-does-micro-mean" target="_BLANK">micro</a> and extensible
* <a href="https://laravel.com/" target="_BLANK">Laravel</a> &mdash; use of similarly styled <a href="https://laravel.com/docs/master/middleware">middleware</a>
* <a href="https://www.peej.co.uk/tonic/" target="_BLANK">Tonic</a> &mdash; use of <a href="https://github.com/peej/tonic#how-it-works" target="_BLANK">resources</a>
* <a href="https://www.restapitutorial.com/lessons/whatisrest.html" target="_BLANK">RESTful</a> principles &mdash; content negotiation, HTTP verbs, URIs, etc.

Thrown into the mix is Drash's own concepts such as:


* Documentation-driven development
* Test-driven development
* Lowering barriers to usage

Drash does not force you to use all of its code. You can pick and choose which data members you want/need and use them however you deem fit. For example, Drash comes with a console logger and a file logger. If you want just these, then you can import just these into your non-Drash project. How you use it is really up to you.

## Contributing

Contributors are welcomed!
