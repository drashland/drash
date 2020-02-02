import Drash from "../mod.ts";

export default class FilesResource extends Drash.Http.Resource {

  static paths = [
    "/files",
    "/files/:name"
  ];

  public GET() {
    return this.response;
  }

  public POST() {
    this.response.body = this.request.getBodyParam("v-bp");
    this.response.body = this.request.getHeaderParam("v-header");
    this.response.body = this.request.getQueryParam("v_qp");
    return this.response;
  }

  public DELETE() {
    return this.response;
  }
}
