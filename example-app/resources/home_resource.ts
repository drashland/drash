import Drash from "../../mod.ts";

/** Define an HTTP resource that handles HTTP requests to the / URI */
export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/", "/:name"];

  /**
   * Handle GET requests.
   */
  public GET() {
    this.response.body = `Hello, ${
      this.request.path_params.name ? this.request.path_params.name : "world"
    }!`;

    return this.response;
  }

  /**
   * Handle POSTS requests.
   */
  public POST() {
    this.response.body = "POST request received!";
    if (this.request.path_params.name) {
      this.response.body = `Hello, ${
        this.request.path_params.name
      }! Your POST request has been received!`;
    }

    return this.response;
  }
}
