import { Drash } from "./deps.ts";

export class GraphQLResource extends Drash.Resource {
  public paths = ["/graphql"];

  public GET(request: Drash.Request, response: Drash.Response): void {
    // This is intentionally left blank.
    //
    // This is only defined to allow GET requests to the front-end playground.
    // Without this, Drash will throw a 405 Method Not Allowed error when
    // requesting to view the playground at /graphql.
  }

  public POST(request: Drash.Request, response: Drash.Response): void {
    // This is intentionally left blank.
    //
    // This is only defined so that POST requests to this resource can be
    // processed. Without this, Drash will throw a 405 Method Not Allowed error
    // when clients try to make GraphQL queries.
  }
}

