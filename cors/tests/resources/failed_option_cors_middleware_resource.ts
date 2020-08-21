import { Drash } from "../../../deps.ts";

export default class FailedOptionCorsMiddlewareResource
  extends Drash.Http.Resource {
  static paths = ["/middleware"];

  public GET() {
    this.response.body = "GET request received!";

    return this.response;
  }

  public OPTIONS() {
    return this.response;
  }
}
