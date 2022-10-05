import * as Drash from "../../mod.bun.ts";

class HomeResource extends Drash.Resource {
  public paths = ["/"];

  public GET(
    request: Drash.Request,
    response: Drash.Response,
  ): Drash.Response {
    return response.body("Hello, Drash (from Bun)!");
  }
}

const requestHandler = await Drash.createRequestHandler({
  resources: [
    HomeResource,
  ],
});

const port = 1447;

Bun.serve({
  port,
  fetch(req) {
    return requestHandler.handle(req);
  },
});

console.log(`Drash server started at http://localhost:${port}`);
