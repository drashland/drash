# Deno Drash

```typescript
// example-app/resources/home.ts

import BaseResource from '../../src/http/base_resource.ts';

class HomeResource extends BaseResource {
  static paths = [
    '/',
    '/hello',
    '/hello/',
    '/hello/:name',
    '/hello/:name/',
  ];

  public HTTP_GET_JSON() {
    this.response.body = {
      hello: this.request.path_params['name']
        ? `Hello ${this.request.path_params['name']}!`
        : 'No name provided.'
    }
    return this.response;
  }
  public HTTP_GET_HTML() {
    this.response.body = this.request.path_params['name']
      ? `Hello ${this.request.path_params['name']}!`
      : 'No name provided.';
      return this.response;
  };
}

export default HomeResource
```

```typescript
// example-app/app.ts

import Drash from '../drash.ts';
import HomeResource from './resources/home.ts';

// let server = new Drash.Server({
//   response_output: 'text/html'
// });
let server = new Drash.Server({
  response_output: 'text/html',
  resources: [
    HomeResource
  ],
  allowed_content_types: [
    'application/json',
    'text/html',
  ]
});

server.run();
```
