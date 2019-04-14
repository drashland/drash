import Resource from "./resource.ts";
import Drash from "../../mod.ts";

/** Define an HTTP resource that handles HTTP requests to the / URI */
export default class HomeResource extends Resource {
  static paths = ["/"];

  /**
   * Handle GET requests.
   */
  public GET() {
    console.log(this.request.body_parsed);
    this.response.body = `Hello, ${
      this.request.url_query_params.name
        ? this.request.url_query_params.name
        : "world"
    }!`;

    this.response.body = `<html><body><form name="test" method="post" action="/"><input type="text" name="hello"><button type="submit">post</button></form></body></html>`;

    return this.response;
  }

  /**
   * Handle POSTS requests.
   */
  public POST() {
    console.log(this.request.body_parsed);
    this.response.body = "POST request received!";
    if (this.request.url_query_params.name) {
      this.response.body = `Hello, ${
        this.request.url_query_params.name
      }! Your POST request has been received!`;
    }

    return this.response;
  }
}
