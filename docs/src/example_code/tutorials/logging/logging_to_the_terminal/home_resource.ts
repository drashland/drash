import Drash from "https://deno.land/x/drash/mod.ts";

export default class HomeResource extends Drash.Http.Resource {

  static paths = ["/"];

  public GET() {
    this.server.logger.fatal("This is a FATAL log message.");
    this.server.logger.error("This is an ERROR log message");
    this.server.logger.warn("This is a WARN log message");
    this.server.logger.info("This is an INFO log message");
    this.server.logger.debug("This is a DEBUG log message");
    this.server.logger.trace("This is a TRACE log message");

    this.response.body = "GET request received! Also, check your terminal to see the log messages written by this resource.";

    return this.response;
  }
}
