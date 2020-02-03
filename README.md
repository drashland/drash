<p align="center">
  <img height="200" src="https://drashland.github.io/deno-drash-docs/public/assets/img/logo_drash.png" alt="Drash logo">
  <h1 align="center">Drash</h1>
</p>
<p align="center">A microframework for <a href="https://github.com/denoland/deno">Deno</a> focused on <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web">resource</a> creation and <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation">content negotiation</a>.</p>
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
    this.response.body = "Hello World!";
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

## Contributing

Contributors are welcomed!
