import Drash from "https://deno.land/x/drash/mod.ts";

export default class HomeResource extends Drash.Http.Resource {

  static paths = ["/"];

  public GET() {
    this.response.body = {
      method: "GET",
      body: "Hello!"
    };
    return this.response;
  }
}

