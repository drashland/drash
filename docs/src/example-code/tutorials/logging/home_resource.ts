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
    // Write an info log message to .tmp/server.log
    this.server.logger.info("Handling GET request.");

    this.response.body = "GET request received!";

    return this.response;
  }
}
