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
 * Taken from https://github.com/deno-libs/gql/blob/master/http.ts but heavily modified to suit drash's needs,
 * and to utilise as much of graphql's own code instead
 */
export class GraphQLService extends Drash.Service
  implements Drash.Interfaces.IService {
  #options: GraphQLOptions;
  constructor(options: GraphQLOptions) {
    super();
    this.#options = options;
  }
  async runBeforeResource(request: Drash.Request, response: Drash.Response) {
    // Handle gets. the expectation should be that on a get, the configs
    // allow a playground
    if (request.method === "GET") {
      const playgroundEndpoint = this.#options.graphiql === true
        ? "/graphql"
        : typeof this.#options.graphiql === "string"
        ? this.#options.graphiql
        : undefined;
      if (!playgroundEndpoint) {
        throw new Drash.Errors.HttpError(
          500,
          "The request method is GET, but the server has not enabled a playground",
        );
      }
      return response.html(
        renderPlaygroundPage({ endpoint: playgroundEndpoint }),
      );
    }

    // Execute the request/query
    const query = request.bodyParam<string>("query");
    const operationName = request.bodyParam<string>("operationName") ?? null;
    const variables = request.bodyParam<Record<string, unknown>>("variables") ??
      null;
    if (typeof query !== "string") {
      throw new Drash.Errors.HttpError(
        422,
        "The query is not of the expected type, it should be a string",
      );
    }
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
    response.json(result); // { data: { hello: "Hello world!" } }
  }
}

//var res = await fetch("/graphql", { method: "POST", body: JSON.stringify({ query: '{ hello }' }) }), must be application/json, and accept header allows json
