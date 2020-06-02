import { Drash } from "../deps.ts";

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];

  public GET() {
    this.response.body = JSON.stringify(
      { success: true, message: "GET request received." },
    );
    return this.response;
  }

  public POST() {
    this.response.body = JSON.stringify({ message: "Not implemented" });
    return this.response;
  }

  public DELETE() {
    this.response.body = JSON.stringify({ message: "Not implemented" });
    return this.response;
  }

  public PUT() {
    this.response.body = JSON.stringify({ message: "Not implemented" });
    return this.response;
  }
}
