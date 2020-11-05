import { Drash } from "../deps.ts";

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];

  public GET() {
    this.response.body = this.response.render("/index.html");
    return this.response;
  }

  public POST() {
    this.response.body = "POST method not implemented.";
    return this.response;
  }

  public DELETE() {
    this.response.body = "DELETE method not implemented.";
    return this.response;
  }

  public PUT() {
    this.response.body = "PUT method not implemented.";
    return this.response;
  }
}
