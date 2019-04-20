import Drash from "https://deno.land/x/drash/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.server.logger.fatal("This is a FATAL log message.");
    this.server.logger.error("This is an ERROR log message");
    this.server.logger.warn("This is a WARN log message");
    this.server.logger.info("This is an INFO log message");
    this.server.logger.debug("This is a DEBUG log message");
    this.server.logger.trace("This is a TRACE log message");
    this.response.body = "GET request received!";
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:1337",
  response_output: "application/json",
  resources: [HomeResource],
  logger: new Drash.Loggers.FileLogger({
    enabled: true,
    level: "all",
    file: "./server.log",
    tag_string: "{datetime} | {level} | ",
    tag_string_fns: {
      datetime() {
        return new Date().toISOString().replace("T", " ");
      }
    },
  })
});

server.run();
