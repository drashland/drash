import { Drash } from "../mod.ts";

export default class FilesResource extends Drash.Http.Resource {
  static paths = ["/files"];

  public async POST() {
    this.response.body = this.request.getBodyFile("file_1");
    return this.response;
  }

  public DELETE() {
    return this.response;
  }
}
