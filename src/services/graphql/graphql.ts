import * as Drash from "../../../mod.ts";
import {
  ExecutionResult,
  graphql,
  GraphQLSchema,
  renderPlaygroundPage,
} from "./deps.ts";

type GraphiQLValue = boolean | string;

interface GraphQLOptions {
  schema: GraphQLSchema;
  graphiql: GraphiQLValue;
  rootValue: Record<string, () => string>;
}

/**
 * The logic in this class has been taken from the following:
 *
 *     https://github.com/deno-libs/gql/blob/master/http.ts
 *
 * It has been modified to suit Drash's needs in order to utilise as much of
 * GraphQLs's own code instead.
 */
export class GraphQLService extends Drash.Service {

  #options: GraphQLOptions;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options: GraphQLOptions) {
    super();
    this.#options = options;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  async runBeforeResource(
    request: Drash.Request,
    response: Drash.Response
  ): void {
    // Handle GET requests. The expectation should be that on a GET request, the
    // configs allow a playground.
    if (request.method.toUpperCase() === "GET") {
      return this.#handleGet(request, response);
    }

    return this.#handleAllOtherRequests(request, response);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIVATE METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Handle GET requets.
   *
   * @param request
   * @param response
   */
  #handlGetRequests(request: Drash.Request, Drash.Response): void {
    const playgroundEndpoint = this.#options.graphiql === true
      ? "/graphql"
      : typeof this.#options.graphiql === "string"
      ? this.#options.graphiql
      : undefined;

    if (!playgroundEndpoint) {
      throw new Drash.Errors.HttpError(
        500,
        "The request method is GET, but the server has not enabled a playground.",
      );
    }

    return response.html(
      renderPlaygroundPage({ endpoint: playgroundEndpoint }),
    );
  }

  /**
   * Handle requests other than GET requets.
   *
   * @param request
   * @param response
   */
  #handleOtherThanGetRequests(
    request: Drash.Request,
    response: Drash.Response
  ): void {
    const query = request.bodyParam<string>("query");

    if (typeof query !== "string") {
      throw new Drash.Errors.HttpError(
        422,
        "The query is not of the expected type, it should be a string.",
      );
    }

    const operationName = request.bodyParam<string>("operationName") ?? null;

    const variables = request.bodyParam<Record<string, unknown>>("variables") ??
      null;

    const result = await graphql(
      this.#options.schema,
      query,
      this.#options.rootValue,
      null,
      variables,
      operationName,
    ) as ExecutionResult;

    if (result.errors) {
      throw new Drash.Errors.HttpError(
        400,
        result.errors[0] as unknown as string,
      );
    }

    response.json(result);
  }
}
