# Drash

Drash is a modular web app framework for [Deno](https://deno.land) that respects RESTful design principles.

Drash helps you build web apps that handle requests to grab resources. Requests can request any representation of a resource (e.g., application/json, text/html, application/xml, etc.) as long as the resource allows it.

## Features
* Content negotation
* Path params (e.g., `/uri/with/some/:id`)
* Semantic routing

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
// File: app/resources/home_resource.ts

import Resource from '../drash/src/http/resource.ts';
import Response from '../drash/src/http/response.ts';

class HomeResource extends Resource {
  static paths = [
    '/',
    '/hello',
    '/hello/',
    '/hello/:name',
    '/hello/:name/',
  ];

  /**
   * Handle GET requests.
   * 
   * @return Response
   */
  public GET(): Response {
    this.response.body = `Hello, ${this.request.path_params.name ? this.request.path_params.name : 'world'}!`;

    return this.response;
  }

  /**
   * Handle POSTS requests.
   */
  public POST(): Response {
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
import HomeResource from "./resources/home_resource.ts";

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

By default, Drash can handle requests for the following content types:

* `application/json`
* `application/xml`
* `text/html`
* `text/xml`

If you want your Drash server to handle more content types, then you will need to override `response.ts` and `resource.ts`.

---

TODO:
* [ ]  Request URL parser
* [ ]  `static Server.getRequestedResponseContentType`
