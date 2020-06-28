import { Drash } from "../../../../mod.ts";

export default class FilesResource extends Drash.Http.Resource {
  static paths = ["/files"];

  public async POST() {
    this.response.body = this.request.getBodyParam("value_1") ?? null;
    return this.response;
  }

  public DELETE() {
    return this.response;
  }
}
