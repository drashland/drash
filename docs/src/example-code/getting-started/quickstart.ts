import Drash from "https://deno.land/x/drash/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"]
  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
  public POST() {
    this.response.body = "POST request received!";
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource]
});

server.run();
