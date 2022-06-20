import { Drash } from "../../../../../deps.ts";

export class HomeResource extends Drash.Resource {
  paths = ["/home"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    response.html("<div>Homepage</div>");
  }
}
