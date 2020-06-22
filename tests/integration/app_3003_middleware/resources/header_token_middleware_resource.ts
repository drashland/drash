import { Drash } from "../../../../mod.ts";

export default class HeaderTokenMiddlewareResource extends Drash.Http.Resource {
  static paths = ["/middleware"];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}
