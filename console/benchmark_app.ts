import { Drash } from "../mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "Hello World!";
    return this.response;
  }
}

const server = new Drash.Http.Server({
  port: 1447,
  resources: [HomeResource],
});

server.runHttp();

console.log(`App running at ${server.getAddress()}.`);
