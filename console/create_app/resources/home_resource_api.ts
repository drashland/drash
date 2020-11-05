import { Drash } from "../deps.ts";

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];

  public GET() {
    this.response.body = { message: "GET request received!" };
    return this.response;
  }

  public POST() {
    this.response.body = { message: "POST method not implemented." };
    return this.response;
  }

  public DELETE() {
    this.response.body = { message: "DELETE method not implemented." };
    return this.response;
  }

  public PUT() {
    this.response.body = { message: "PUT method not implemented." };
    return this.response;
  }
}
