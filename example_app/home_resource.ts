import Drash from "../mod.ts";

export default class HomeResource extends Drash.Http.Resource {

  static paths = ["/"];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }

  public async POST() {
    this.response.body = await this.request.getBodyFile("file", 1024 * 1024);
    return this.response;
  }
}
