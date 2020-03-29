import Drash from "../mod.ts";

export default class FilesResource extends Drash.Http.Resource {
  static paths = ["/files"];

  public async POST() {
    this.response.body = new TextDecoder().decode(
      await Deno.readAll(this.request.getBodyFile("file_1").contents),
    );
    return this.response;
  }

  public DELETE() {
    return this.response;
  }
}
