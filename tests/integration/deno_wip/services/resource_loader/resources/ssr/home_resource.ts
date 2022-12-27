import { Drash } from "../../../../deps.ts";

export class HomeResource extends Drash.Resource {
  paths = ["/home"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.html("<div>Homepage</div>");
  }
}
