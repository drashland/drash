import Drash from "https://deno.land/x/drash/mod.ts";

export default class MyResource extends Drash.Http.Resource {
  static paths = [
    "/",
    "/:something_cool"
  ];

  public GET() {
    this.response.body = "GET request received!";

    let pathParam = this.request.getPathParam('something_cool');
    if (pathParam) {
      this.response.body += ` Path param "${pathParam}" received!`;
    }

    let queryParam = this.request.getQueryParam('something_cool');
    if (queryParam) {
      this.response.body += ` URL query param "${queryParam}" received!`;
    }

    let bodyParam = this.request.getBodyParam('something_cool');
    if (bodyParam) {
      this.response.body += ` Body param "${bodyParam}" received!`;
    }

    return this.response;
  }
}
