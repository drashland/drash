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
  #playground_enabled = false;
  #playground_endpoint = "/graphql";

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

    // Not enabled, so skip setting up the playground
    if (!serviceOptions.graphiql) {
      return;
    }

    this.#playground_enabled = true;

    // If the user specified a string, then they are defining a different
    // endpoint for the GraphQL playground
    if (typeof this.#options.graphiql === "string") {
      this.#playground_endpoint = this.#options.graphiql;

      return options.server.addResource(
        this.#createUserDefinedGraphQLResource(this.#options.graphiql),
      );
    }

    // Default to the /graphql resource
    options.server.addResource(GraphQLResource);
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
   * Create the user-defined playground resource.
   *
   * @param endpoint - The endpoint the playground will be accessible at.
   *
   * @returns The GraphQL playground resource.
   */
  #createUserDefinedGraphQLResource(endpoint: string): typeof Drash.Resource {
    return class UserDefinedGraphQLResource extends GraphQLResource {
      public paths = [endpoint];
      public services = {
        ALL: [this as unknown as Drash.Service],
      };
    };
  }

  /**
   * Handle GET requets.
   *
   * @param request
   * @param response
   */
  #handleGetRequests(_request: Drash.Request, response: Drash.Response): void {
    if (!this.#playground_enabled) {
      throw new Drash.Errors.HttpError(
        500,
        "The GraphQL playground is not enabled.",
      );
    }

    return response.html(
      renderPlaygroundPage({ endpoint: this.#playground_endpoint }),
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
