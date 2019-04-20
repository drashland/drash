import Drash from "https://deno.land/x/drash/mod.ts";

export default class MyResource extends Drash.Http.Resource {

  static paths = [
    "/",
    "/path/with/:my_param",
  ];

  public GET() {
    this.response.body = "GET request received!";
    if (this.request.path_params.my_param) {
      this.response.body += ` Path param "${this.request.path_params.my_param}" received!`;
    }
    if (this.request.url_query_params.my_param) {
      this.response.body += ` URL query param "${this.request.url_query_params.my_param}" received!`;
    }
    if (this.request.body_parsed.my_param) {
      this.response.body += ` Body param "${this.request.body_parsed.my_param}" received!`;
    }
    return this.response;
  }
}