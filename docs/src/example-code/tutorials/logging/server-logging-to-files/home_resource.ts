import Drash from "https://deno.land/x/drash/mod.ts";

/**
 * Create an HTTP resource that handles HTTP requests to the / URI
 */
export default class HomeResource extends Drash.Http.Resource {
  /**
   * Define the paths (a.k.a. URIs) that clients can use to access this resource.
   */
  static paths = ["/"];

  /**
   * Handle GET requests.
   */
  public GET() {
    // Write an INFO log message to /path/to/your/project/tmp/server.log. The `server.logger` object
    // can accept the following methods:
    //
    //     debug() (e.g., this.server.logger.debug(message);)
    //     error() (e.g., this.server.logger.error(message);)
    //     fatal() (e.g., this.server.logger.fatal(message);)
    //     info()  (e.g., this.server.logger.info(message);)
    //     trace() (e.g., this.server.logger.trace(message);)
    //     warn()  (e.g., this.server.logger.warn(message);)
    //
    this.server.logger.info("Howdy! I'm handling your GET request.");

    this.response.body = "GET request received!";

    return this.response;
  }
}
