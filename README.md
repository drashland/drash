# Drash

Drash is a modular web app framework for [Deno](https://deno.land) that respects RESTful design principles.

Drash helps you build web apps that handle requests to grab resources. Requests can request any representation of a resource (e.g., application/json, text/html, application/xml, etc.) as long as the resource allows it.

## Features
* Content Negotation
* Path Params (e.g., `/uri/with/some/:id`)

## Quickstart

### Step 1 of 6: Install Deno

Installation instructions can be found here: [https://deno.land/](https://deno.land/)

### Step 2 of 6: Make Your App Directory And Download Drash

```
$ mkdir app
$ mkdir app/resources
$ cd app
$ git clone https://github.com/crookse/deno-drash.git drash
```

### Step 3 of 6: Create An HTTP Resource File

```typescript
// File: app/resources/home.ts

import Resource from "../drash/src/http/resource.ts";

class HomeResource extends Resource {
  static paths = [
    '/',
    '/hello',
    '/hello/',
    '/hello/:name',
    '/hello/:name/',
  ];

  /**
   * Handle GET requests that request a JSON response.
   */
  public GET_JSON() {
    this.response.body = {
      hello: this.request.path_params.name
        ? `Hello ${this.request.path_params.name}!`
        : 'No name provided.'
    }
    return this.response;
  }

  /**
   * Handle GET requests that request an HTML response.
   */
  public GET_HTML() {
    this.response.body = this.request.path_params.name
      ? `Hello ${this.request.path_params.name}!`
      : 'No name provided.';
      return this.response;
  };

  /**
   * Handle POSTS requests that request an HTML response.
   */
  public POST_HTML() {
    this.response.body = 'POST request received.';
    return this.response;
  }
}

export default HomeResource

```

### Step 4 of 6: Create Your App File

```typescript
// File: app/app.ts

import Drash from "./drash/drash.ts";
import HomeResource from "./resources/home.ts";

let server = new Drash.Server({
  response_output: 'text/html',
  resources: [
    HomeResource
  ]
});

server.run();
```

### Step 5 of 6: Run Your App

```
$ deno app.ts --allow-net
```

### Step 6 of 6: Make An HTTP Request

* Go to: `localhost:8000/`
* Go to: `localhost:8000/hello`
* Go to: `localhost:8000/hello/`
* Go to: `localhost:8000/hello/:name`
* Go to: `localhost:8000/hello/:name/`

## Things To Know

By default, resource classes can handle requests for the following content types:

* `application/json`
* `application/xml`
* `text/html`
* `text/xml`

Each content type is mapped to a specific suffix (as seen on line 8 of [resource.ts](https://github.com/crookse/deno-drash/blob/master/src/http/resource.ts) and below).

```
// File: src/http/resource.ts
// Line 8

protected method_mappings = {
  'application/json': 'JSON',
  'application/xml':  'XML',
  'text/html':        'HTML',
  'text/xml':         'XML',
};
```

These suffixes are concatenated to the request method (e.g, `{REQUEST_METHOD}_{SUFFIX}`) to make up the name of the resource method that should be called. This is how Drash decides what method to call in a resource class. For example, if the request method is `GET` and the request is requesting a response with a content type of `application/json`, then the resource method that will be called is `GET_JSON()`. If the method doesn't exist, then a `405 (Method Not Allowed)` response is sent.

These mappings can be overridden in the configs. For example:

```typescript
// File: app/app.ts

import Drash from "./drash/drash.ts";
import HomeResource from "./resources/home.ts";

let server = new Drash.Server({
  response_output: 'text/html',
  resources: [
    HomeResource
  ],
  resource_method_mappings: {
    'application/json': 'appJson',  // requires resource class to have {REQUEST_METHOD}_appJson()
    'application/xml':  'appXml',   // requires resource class to have {REQUEST_METHOD}_appXml()
    'text/html':        'textHtml', // requires resource class to have {REQUEST_METHOD}_textHtml()
    'text/xml':         'textXml',  // requires resource class to have {REQUEST_METHOD}_textXml()
  }
});

server.run();
```

---

TODO:
* [ ]  Request URL parser
* [ ]  `static Server.getRequestedResponseContentType`
