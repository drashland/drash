import { Drash } from "../../../../mod.ts";

export default class OptionalPathParamsResource extends Drash.Http.Resource {
  static paths = [
    "/oppWithoutRequired/:name?/:age_of_person?/:ci-ty?",
    "/oppWithRequired/:name/:age_of_person?",
  ];

  public GET() {
    const name = this.request.getPathParam("name");
    const age_of_person = this.request.getPathParam("age_of_person");
    const city = this.request.getPathParam("ci-ty");

    this.response.body = JSON.stringify({
      message: "Successfully handled optional path params",
      data: {
        name,
        age_of_person,
        city,
      },
    });
    return this.response;
  }
}
