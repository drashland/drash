# Deno Drash

```typescript
import Drash from 'drash.ts';
import HomeResource from './resources/home.ts';

let server = new Drash.Server({
  resources: [
    HomeResource
  ]
});

server.run();
```
