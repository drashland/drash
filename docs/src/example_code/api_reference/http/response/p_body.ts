import Drash from " https://deno.land/x/drash/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "Ok... you got me.";
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "application/json",
  resources: [HomeResource],
  logger: new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "debug"
  })
});

server.run();
