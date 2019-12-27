import Drash from "https://deno.land/x/drash/mod.ts";

export default class HomeResource extends Drash.Http.Resource {

  static paths = ["/"];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }

  public POST() {
    this.response.body = "POST request received!";
    return this.response;
  }

  public PUT() {
    this.response.body = "PUT request received!";
    return this.response;
  }

  public DELETE() {
    this.response.body = "DELETE request received!";
    return this.response;
  }
}
