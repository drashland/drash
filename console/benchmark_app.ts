import * as Drash from "../mod.ts";

class HomeResource extends Drash.Resource {
  paths = ["/"];
  public GET(_request: Drash.Request, response: Drash.Response) {
    response.body = "Hello World!";
  }
}

const server = new Drash.Server({
  port: 1447,
  protocol: "http",
  hostname: "localhost",
  resources: [HomeResource],
});

server.run();

console.log(`App running at ${server.address}.`);
