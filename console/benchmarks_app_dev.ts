import * as Drash from "../mod.ts";
import { Resource } from "../mod.ts";

export class Resource extends Resource {
  static paths = ["/", "/:some_param"];

  public GET(): Drash.DrashResponse {
    this.response.body = "test";
    return this.response;
  }
}

export class CoffeeResource extends Resource {
  public paths = ["/coffee", "/coffee/:some_param"];

  public async GET(): Promise<Drash.DrashResponse> {
    return this.response;
  }
}

const server = new Drash.Server({
  resources: [
    Resource,
    CoffeeResource,
  ],
});

server.runHttp();

console.log(`Server running at ${server.address}`);

Deno.run({
  cmd: ["autocannon", "-c", "40", "-d", "5", "http://localhost:1337"],
});
