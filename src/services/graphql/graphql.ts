import {
  Drash,
  ExecutionResult,
  GraphQL,
  renderPlaygroundPage,
} from "./deps.ts";
import { GraphQLResource } from "./graphql_resource.ts";
export { GraphQL };

type GraphiQLValue = boolean | string;

interface GraphQLOptions {
  schema: GraphQL.GraphQLSchema;
  graphiql: GraphiQLValue;
  // TODO(crookse) Figure out how to add typings for the args
  // deno-lint-ignore no-explicit-any
  rootValue: Record<string, (...args: any) => string>;
  playground_path?: string;
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

  public runAtStartup(options: Drash.Interfaces.IServiceStartupOptions): void {
    const serviceOptions = this.#options;

    if (serviceOptions.playground_path === undefined) {
      return options.server.addResource(GraphQLResource);
    }

    const createUserDefinedPlayground = () => {
      return class UserDefinedGraphQLResource extends GraphQLResource {
        public paths = [serviceOptions.playground_path!];
        public services = {
          ALL: [this as unknown as Drash.Service],
        };
      };
    };

    options.server.addResource(createUserDefinedPlayground());
  }

  async runBeforeResource(
    request: Drash.Request,
    response: Drash.Response,
  ): Promise<void> {
    // Handle GET requests. The expectation should be that on a GET request, the
    // configs allow a playground.
    if (request.method.toUpperCase() === "GET") {
      return this.#handleGetRequests(request, response);
    }

    return await this.#handleAllOtherRequests(request, response);
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
  #handleGetRequests(_request: Drash.Request, response: Drash.Response): void {
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
  async #handleAllOtherRequests(
    request: Drash.Request,
    response: Drash.Response,
  ): Promise<void> {
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

    const result = await GraphQL.graphql(
      this.#options.schema,
      query,
      this.#options.rootValue,
      null,
      variables,
      operationName,
    ) as ExecutionResult;

    if (result.errors) {
      return response.json(result.errors, 400);
    }

    response.json(result);
  }
}
