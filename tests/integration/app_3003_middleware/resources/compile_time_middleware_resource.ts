import { Drash } from "../../../../mod.ts";

export default class CompileTimeMiddlewareResource extends Drash.Http.Resource {
  static paths = ["/compile-time-middleware"];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}
