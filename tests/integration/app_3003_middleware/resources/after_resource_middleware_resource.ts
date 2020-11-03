import { Drash } from "../../../../mod.ts";

export class AfterResourceMiddlewareResource extends Drash.Http.Resource {
  static paths = ["/template-engine-middleware"];

  public GET() {
    this.response.body = this.response.render("hello", { what: "ok" });
    return this.response;
  }
}
