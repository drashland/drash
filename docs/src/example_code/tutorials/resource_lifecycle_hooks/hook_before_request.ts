import Drash from "https://deno.land/x/drash/mod.ts";

export default class MyResource extends Drash.Http.Resource {
  static paths = ["/"];

  public hook_beforeRequest() {
    console.log("Hooked before the request!");
  }

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}
