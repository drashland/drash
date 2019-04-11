import Drash from "https://deno.land/x/drash/mod.ts";

class HomeResource extends Drash.Http.Resource {

  static paths = ["/"];

  public GET() {
    this.response.body = "Hello World!";
    return this.response;
  }

  public POST() {
    this.response.body = "POST request received!";
    if (this.request.url_query_params.name) {
      this.response.body += ` Thanks for the request, ${name}!`;
    }
    return this.response;
  }
}
