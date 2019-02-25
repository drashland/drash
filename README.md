![GitHub release](https://img.shields.io/github/release/crookse/deno-drash.svg?label=latest)

_Note: Use `import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/master/mod.ts"`. Importing from https://deno.land/x/ (e.g., `import Drash from "https://deno.land/x/drash/mod.ts"`) is still being processed._

# Drash

Drash is a modular web app framework for [Deno](https://deno.land) based on HTTP resources and content negotiation.

Drash helps you quickly build web apps, APIs, services, and whatever else you'd want to build using [HTTP resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web) and [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation). Clients can make requests to any resource you create and can request any representation your resources allow (e.g., `application/json` format of the resource located at the `/user/1234` URI).

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

## Quickstart

### Step 1 of 6: Install Deno

Installation instructions can be found here: [https://deno.land/](https://deno.land/)

### Step 2 of 6: Create Your App Directory

```
$ mkdir app
$ cd app
```

### Step 3 of 6: Create An HTTP Resource File

**File: `app/home_resource.ts`**

```typescript
import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/master/mod.ts";

/** Define an HTTP resource that handles HTTP requests to the / URI */
export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/", "/:name"];

  /**
   * Handle GET requests.
   */
  public GET() {
    this.response.body = `Hello, ${
      this.request.path_params.name ? this.request.path_params.name : "world"
    }!`;

    return this.response;
  }

  /**
   * Handle POSTS requests.
   */
  public POST() {
    this.response.body = "POST request received!";
    if (this.request.path_params.name) {
      this.response.body = `Hello, ${
        this.request.path_params.name
      }! Your POST request has been received!`;
    }

    return this.response;
  }
}
```

### Step 4 of 6: Create Your App File

_Note: The `response_output` config tells your Drash server what content type to send by default. If you don't specify this value, then Drash will automatically set it to `application/json`. You can change the `response_output` config to `application/json`, `text/html`, `application/xml`, or `text/xml`. If you want your Drash server to handle more content types, then see [Adding More Content Types](https://github.com/crookse/deno-drash#adding-more-content-types) below._

**File: `app/app.ts`**

```typescript
import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/master/mod.ts";
import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "application/json",
  resources: [HomeResource]
});

server.run();
```

### Step 5 of 6: Run Your App

```
$ deno app.ts --allow-net
```

### Step 6 of 6: Make The Following HTTP Requests

_Note: I recommend using [Postman](https://www.getpostman.com/) to make these requests. It's fast and versatile for web development._

- GET `localhost:8000/`
- GET `localhost:8000/:name`
- POST `localhost:8000/`
- POST `localhost:8000/:name`

---

## Adding More Content Types

Drash servers use the `Drash.Http.Response` class to generate responses and send them to clients. It can generate responses of the following content types:

- `application/json`
- `application/xml`
- `text/html`
- `text/xml`

If you want your Drash server to handle more content types, then you will need to override `Drash.Http.Response` and its `send()` method. See the steps below to override `Drash.Http.Response` and its `send()` method:

_Note: The following steps assume you're using the example code above._

### Step 1 of 2: Create Your `Response` Class.

**File: `app/response.ts`**

```typescript
import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/master/mod.ts";

/** Response handles sending a response to the client making the HTTP request. */
export default class Response extends Drash.Http.Response {
  /**
   * @overrides `Drash.Http.Response.send()`
   *
   * Send a response to the client.
   */
  public send(): void {
    let body;

    switch (this.headers.get("Content-Type")) {
      // Handle HTML
      case "text/html":
        body = this.body;
        break;

      // Handle JSON
      case "application/json":
        body = JSON.stringify({ body: this.body });
        break;

      // Handle PDF
      case "application/pdf":
        this.headers.set("Content-Type", "text/html");
        body = `<html><body style="height: 100%; width: 100%; overflow: hidden; margin: 0px; background-color: rgb(82, 86, 89);"><embed width="100%" height="100%" name="plugin" id="plugin" src="https://www.adobe.com/content/dam/acom/en/security/pdfs/AdobeIdentityServices.pdf" type="application/pdf" internalinstanceid="19"></body></html>`;
        break;

      // Handle XML
      case "application/xml":
      case "text/xml":
        body = `<body>${this.body}</body>`;
        break;

      // Handle plain text
      case "text/plain":
        body = this.body;
        break;

      // Default to this
      default:
        body = this.body;
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

### Step 2 of 2: Modify Your App File

**File: `app/app.ts`**

```diff
import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/master/mod.ts";
+
+import Response from "./response.ts";
+Drash.Http.Response = Response;
+
+
 import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: 'localhost:8000',
  response_output: 'application/json',
  resources: [
    HomeResource
  ]
});

 server.run();
```

---

## Roadmap

- [ ] Tagged file and console logging
- [ ] Documentation and API reference pages (to be located at https://crookse.github.io/projects/deno-drash/)
- [ ] Provide pathname of resources instead adding imported files in the `resources` config
- [ ] How To: Grabbing different representations of a resource
- [ ] CI process
