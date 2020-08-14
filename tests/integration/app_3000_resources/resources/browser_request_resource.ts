import { Drash } from "../../../../mod.ts";

export default class BrowserRequestResource extends Drash.Http.Resource {
  static paths = ["/browser-request"];

  public GET() {
    this.response.body = {};
    return this.response;
  }
}
