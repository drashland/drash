![GitHub release](https://img.shields.io/github/release/crookse/deno-drash.svg?label=latest) ![Travis (.org) branch](https://img.shields.io/travis/crookse/deno-drash/v0.5.0.svg)

`import Drash from "https://deno.land/x/drash@v0.6.2/mod.ts";`

# Drash

[View Documentation](https://crookse.github.io/deno-drash/#/) (still a work in progress)

Drash is a modular web framework for [Deno](https://deno.land) based on [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web) and [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation).

Drash helps you quickly build web apps, APIs, services, and whatever else you'd want to build using HTTP resources and content negotiation. Clients can make requests to any resource you create and can request any representation your resources allow (e.g., `application/json` format of the resource located at the `/user/1234` URI).

Although this module is working, it is still very much under development. [Reporting of bugs](https://github.com/crookse/deno-drash/issues) is greatly appreciated.

## Contributing

Contributions are appreciated. Fork and send a pull request :)

## Quickstart

#### Step 1 of 4: Create your `/path/to/your/project/app.ts` file.

```typescript
Deno.env().DRASH_SERVER_DIRECTORY = "/path/to/your/project"; // no trailing slash

import Drash from "https://deno.land/x/drash/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = `<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" type="text/css" href="/public/style.css">
  </head>
  <body>
    <p>GET request received!</p>
  </body>
</html>`;
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource],
  static_paths: ["/public"] // The logic that handles static paths will prepend the value of Deno.env().DRASH_SERVER_DIRECTORY to "/public"
});

server.run();
```

#### Step 2 of 4: Create your `/path/to/your/project/public/style.css` file

```css
body {
    font-family: Arial;
    color: #4bb543;
}
```

#### Step 3 of 4: Run your `/path/to/your/project/app.ts` file.

```shell
$ deno /path/to/your/project/app.ts --allow-net --allow-env
```

#### Step 4 of 4: Check out your app in the browser.

Navigate to `localhost:8000`.

## Features

**HTTP Resources**

Drash uses [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web). It doesn't use controllers and it doesn't use `app.get('/', someHandler())`-like syntax. You create a resource class, define its URIs, and give it HTTP methods (e.g., `GET()`, `POST()`, `PUT()`, `DELETE()`, etc.).

**Content Negotiation**

Drash is based on resources and you can't have true resources unless clients can request different representations of those resources through [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation). Drash ships with `application/json`, `text/html`, `application/xml`, and `text/xml` handling just to meet the needs of standard APIs and web apps. However, you can add more content types for your Drash server to handle. See [Adding More Content Types](https://crookse.github.io/deno-drash/#/tutorials/adding-content-types) for further information.

**Request Path Params (e.g., `/users/:id`)**

If you want to build your RESTful/ish API, then go ahead and use your path params. Resources can access their URI's path params via `this.request.path_params.some_param`.

**Request URL Query Params (e.g., `/users?id=1234`)**

Can't have path params and not have request URL query params. Resources can access the request's URL query params via `this.request.url_query_params.some_param`.

**Semantic Method Names**

If you want your resource class to allow `GET` requests, then give it a `GET()` method. If you want your resource class to allow `POST` requests, then give it a `POST()` method. If you don't want your resource class to allow `DELETE` requests, then don't give your resource class a `DELETE()` method. Pretty simple ideology and very semantic.
