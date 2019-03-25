import Drash from " https://deno.land/x/drash/mod.ts";
import { Status } from "https://deno.land/x/http/http_status.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public PUT() {
    this.response.status_code = Status.NoContent;
    console.log(this.response.getStatusMessage()); // Outputs => "No Content"
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
