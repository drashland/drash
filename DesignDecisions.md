# Design Decisions

```typescript
class ResourceA extends Drash.Resource {
  public GET(request: Drash.Request, response: Drash.Response): Drash.Response {
    if (request.headers.get("world")) {
      return response.text("Hello, World!");
    }

    return response.text("Hello!");
  }
}

class ResourceB extends Drash.Resource {
  public GET(request: Drash.Request): Response {
    if (request.headers.get("world")) {
      return new Response("Hello, World!");
    }

    return new Response("Hello!");
  }
}
```

ResourceA allows a response to be built accumulatively througout the request-resource-response lifecycle. This means any layer inside Drash can take action on the response without having to return a `Response`.

Resource B does not allow a response to be built accumulatively throughout the request-resource-response lifecycle. This means all layers inside Drash that handle a request ___MUST___ return a `new Response()`.

To put this into perspective, let's say we have the following `ResourceB` application.

```typescript
class ResourceB extends Drash.Resource {
  public GET(request: Drash.Request): Response {
    if (request.headers.get("world")) {
      return new Response("Hello, World!");
    }

    return new Response("Hello!");
  }
}

class ServiceA {
  runAfterResource(request: Drash.Request): Response {
    // Omitted for brevity
  }
}
```

In the above code, the flow in Drash will be:

1. Request goes to `ResourceB`.
2. `ResourceB` handles request and returns a `new Response()`.
3. Ok.... it makes sense.