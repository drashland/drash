# Drash

Drash is a modular web app framework for [Deno](https://deno.land) that respects RESTful design principles.

Drash helps you build web apps that handle requests to grab resources. The request can request any representation of a resource (e.g., application/json, text/html, application/xml, etc.) as long as the resource allows the representation to be requested.

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

import BaseResource from "../drash/src/http/base_resource.ts";

class HomeResource extends BaseResource {
  /**
   * The list of paths (a.k.a endpoints) where clients can access this resource
   */
  static paths = [
    '/',
    '/hello',
    '/hello/',
    '/hello/:name',
    '/hello/:name/',
  ];

  /**
   * Handle GET requests that request responses with a Content-Type of application/json
   */
  public HTTP_GET_JSON() {
    this.response.body = {
      hello: this.request.path_params['name']
        ? `Hello ${this.request.path_params['name']}!`
        : 'No name provided.'
    }
    return this.response;
  }
  
  
  /**
   * Handle GET requests that request responses with a Content-Type of text/html
   */
  public HTTP_GET_HTML() {
    this.response.body = this.request.path_params['name']
      ? `Hello ${this.request.path_params['name']}!`
      : 'No name provided.';
    return this.response;
  };
}

export default HomeResource
```

### Step 4 of 6: Create Your App File

```typescript
// File: app/app.ts

import Drash from "./drash/drash.ts";
import HomeResource from "./resources/home.ts";

// let server = new Drash.Server({
//   response_output: 'text/html'
// });
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
