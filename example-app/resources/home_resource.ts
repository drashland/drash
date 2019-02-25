import Resource from "./resource.ts";

/** Define an HTTP resource that handles HTTP requests to the / URI */
export default class HomeResource extends Resource {
  static paths = ["/"];

  /**
   * Handle GET requests.
   */
  public GET() {
    this.response.body = `Hello, ${
      this.request.url_query_params.name ? this.request.url_query_params.name : "world"
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
