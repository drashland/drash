import { Drash } from "../../../../mod.ts";

export default class OptionalPathParamsResource extends Drash.Http.Resource {
  static paths = ["/person/:name?/:age?/:city?"];

  public GET() {
    const name = this.request.getPathParam("name");
    const age = this.request.getPathParam("age");
    const city = this.request.getPathParam("city");

    this.response.body = JSON.stringify({
      message: "Successfully handled optional path params",
      data: {
        name,
        age,
        city
      }
    })
    return this.response
  }
}