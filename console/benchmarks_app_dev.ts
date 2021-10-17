import * as Drash from "../mod.ts";

export class Resource extends Drash.Resource {
  static paths = ["/", "/:someParam"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    response.body = "test";
  }
}

export class CoffeeResource extends Resource {
  public paths = ["/coffee", "/coffee/:someParam"];

  public GET(_request: Drash.Request, _response: Drash.Response) {
  }
}

const server = new Drash.Server({
  protocol: "http",
  hostname: "127.0.0.1",
  port: 1337,
  resources: [
    Resource,
    CoffeeResource,
  ],
});

server.run();

console.log(`Server running at ${server.address}`);

// Deno.run({
//   cmd: ["autocannon", "-c", "40", "-d", "5", "http://localhost:1337"],
// });
