![GitHub release](https://img.shields.io/github/release/crookse/deno-drash.svg?label=latest) [![Build Status](https://travis-ci.org/crookse/deno-drash.svg?branch=master)](https://travis-ci.org/crookse/deno-drash)

`import Drash from "https://deno.land/x/drash/mod.ts";`

`import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/master/mod.ts";`

# Drash

Drash is a modular web framework for [Deno](https://deno.land) based on [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web) and [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation).

Drash helps you quickly build web apps, APIs, services, and whatever else you'd want to build using HTTP resources and content negotiation. Clients can make requests to any resource you create and can request any representation your resources allow (e.g., `application/json` format of the resource located at the `/user/1234` URI).

Documentation is [here](https://crookse.github.io/projects/deno-drash/), but still a work in progress.

Although this module is working, it is still very much under development. [Reporting of bugs](https://github.com/crookse/deno-drash/issues) is greatly appreciated.

## Quickstart

#### Step 1 of 3: Create your `app.ts` file.

```typescript
import Drash from "https://deno.land/x/drash/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"]
  public GET() {
    this.response.body = "GET request received!";
  }
  public POST() {
    this.response.body = "POST request received!";
  }
}

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource]
});

server.run();
```

#### Step 2 of 3: Run your `app.ts` file.

```shell
$ deno app.ts --allow-net
```

#### Step 3 of 3: Make the following HTTP requests:

_Note: I recommend using [Postman](https://www.getpostman.com/) to make these requests. It's fast and versatile for web development._

- `GET localhost:8000/`
- `GET localhost:8000?name=Thor`
- `POST localhost:8000/`
- `POST localhost:8000?name=Hulk`

## Features

**HTTP Resources**

Drash uses [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web). It doesn't use controllers and it doesn't use `app.get('/', someHandler())`-like syntax. You create a resource class, define its URIs, and give it HTTP methods (e.g., `GET()`, `POST()`, `PUT()`, `DELETE()`, etc.).

**Content Negotiation**

Drash is based on resources and you can't have true resources unless clients can request different representations of those resources through [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation). Drash ships with `application/json`, `text/html`, `application/xml`, and `text/xml` handling just to meet the needs of standard APIs and web apps. However, you can add more content types for your Drash server to handle. See [Adding More Content Types](https://github.com/crookse/deno-drash#adding-more-content-types) below for further information.

**Request Path Params (e.g., `/users/:id`)**

If you want to build your RESTful/ish API, then go ahead and use your path params. Resources can access their URI's path params via `this.request.path_params.some_param`.

**Request URL Query Params (e.g., `/users?id=1234`)**

Can't have path params and not have request URL query params. Resources can access the request's URL query params via `this.request.url_query_params.some_param`.

**Semantic Method Names**

If you want your resource class to allow `GET` requests, then give it a `GET()` method. If you want your resource class to allow `POST` requests, then give it a `POST()` method. If you don't want your resource class to allow `DELETE` requests, then don't give your resource class a `DELETE()` method. Pretty simple ideology and very semantic.

---

## Adding More Content Types

Drash servers use the `Drash.Http.Response` class to generate responses and send them to clients. It can generate responses of the following content types:

- `application/json`
- `application/xml`
- `text/html`
- `text/xml`

If you want your Drash server to handle more content types, then you will need to override `Drash.Http.Response` and its `send()` method. See the steps below to override `Drash.Http.Response` and its `send()` method:

_Note: The following steps assume you're using the example code above._

#### Step 1 of 2: Create your `response.ts` file.

```typescript
import Drash from "https://deno.land/x/drash/mod.ts";

/**
 * Export the `Response` class that `Drash.Http.Server` will use.
 *
 * This class will be used to replace `Drash.Http.Response` before `Drash.Http.Server` is created.
 */
export default class Response extends Drash.Http.Response {
  /**
   * Send a response to the client.
   * @return any
   */
  public send(): any {
    let body;

    switch (this.headers.get("Content-Type")) {

      // Handle HTML
      case "text/html":
        body = `<!DOCTYPE html><head><link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet"></head><body class="m-10">${this.body}</body></html>`;
        break;

      // Handle JSON
      case "application/json":
        body = JSON.stringify({ body: this.body });
        break;

      // Handle PDF
      case "application/pdf":
        this.headers.set("Content-Type", "text/html");
        body = `<html><body style="height: 100%; width: 100%; overflow: hidden; margin: 0px; background-color: rgb(82, 86, 89);"><embed width="100%" height="100%" name="plugin" id="plugin" src="https://crookse.github.io/public/files/example.pdf" type="application/pdf" internalinstanceid="19"></body></html>`;
        break;

      // Handle XML
      case "application/xml":
      case "text/xml":
        body = `<body>${this.body}</body>`;
        break;

      // Handle plain text and also default to this
      case "text/plain":
      default:
        body = `${this.body}`;
        break;
    }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body)
    });
  }
}


```

#### Step 2 of 2: Modify your `app.ts` file.

```diff
import Drash from "https://deno.land/x/drash/mod.ts";
+
+import Response from "./response.ts";
+Drash.Http.Response = Response;
+
class HomeResource extends Drash.Http.Resource {
  static paths = ["/"]
  public GET() {
    this.response.body = "GET request received!";
  }
  public POST() {
    this.response.body = "POST request received!";
  }
}

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource]
});

server.run();
```

---

## Roadmap

- [ ] File logging
- [ ] Tagged logging
- [ ] Documentation and API reference pages (to be located at https://crookse.github.io/projects/deno-drash/)
- [ ] `Drash.addApplication(name: string, application: any)` so that any application can be used globally in a Drash project
- [ ] Middleware
- [ ] How To: Adding middleware
- [ ] How To: Grabbing different representations of a resource
- [ ] How To: Creating an SPA
- [ ] How To: Creating GitHub Pages
