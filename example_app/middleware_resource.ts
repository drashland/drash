import Drash from "../mod.ts";

export default class MiddlewareResource extends Drash.Http.Resource {
  static paths = ["/middleware"];
  static middleware = {
    before_request: [
      "Middleware",
    ],
  };

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}
