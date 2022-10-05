import { Types } from "../../../mod.deno.ts";
import { Drash } from "./deps.ts";

export class GraphQLResource extends Drash.Resource {
  public paths = ["/graphql"];

  public GET(
    _request: Drash.Request,
    response: Drash.Response,
  ): Types.Promisable<Drash.Interfaces.ResponseBuilder> {
    // This is only defined to allow GET requests to the front-end playground.
    // Without this, Drash will throw a 501 Not Implemented error when
    // requesting to view the playground at /graphql.
    return response;
  }

  public POST(
    _request: Drash.Request,
    response: Drash.Response,
  ): Types.Promisable<Drash.Interfaces.ResponseBuilder> {
    // This is only defined so that POST requests to this resource can be
    // processed. Without this, Drash will throw a 501 Not Implemented error
    // when clients try to make GraphQL queries.
    return response;
  }
}
