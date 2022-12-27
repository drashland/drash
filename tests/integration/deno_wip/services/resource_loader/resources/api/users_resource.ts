import { Drash } from "../../../../deps.ts";

export class UsersResource extends Drash.Resource {
  paths = ["/api/users"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.json([
      {
        id: 1,
        name: "Ed",
      },
      {
        id: 2,
        name: "Breno",
      },
    ]);
  }

  public POST(_request: Drash.Request, response: Drash.Response) {
    return response.json([
      {
        id: 1,
        name: "Eric",
      },
      {
        id: 2,
        name: "Sara",
      },
    ]);
  }
}
