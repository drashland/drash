import Drash from "../mod.ts";

export default class HomeResource extends Drash.Http.Resource {

  static paths = [
    "/",
    "/users",
    "/users/:id",
  ];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }

  public async POST() {
    return this.response;
  }
}
