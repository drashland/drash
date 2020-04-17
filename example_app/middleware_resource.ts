import { Drash, Middleware } from "../mod.ts";

export default class MiddlewareResource extends Drash.Http.Resource {

  static paths = ["/middleware"];

  @Middleware("Middleware")
  // @ts-ignore
  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}
