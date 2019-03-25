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
    this.response.body = `Hello, ${
      this.request.url_query_params.name
        ? this.request.url_query_params.name
        : "world"
    }!`;

    return this.response;
  }

  /**
   * Handle POSTS requests.
   */
  public POST() {
    this.response.body = "POST request received!";
    if (this.request.url_query_params.name) {
      this.response.body = `Hello, ${
        this.request.url_query_params.name
      }! Your POST request has been received!`;
    }

    return this.response;
  }
}
