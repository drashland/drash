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

function getPlaygroundEndpoint(graphiql: GraphiQLValue): string | undefined {
  const playgroundEndpoint = graphiql === true
    ? "/graphql"
    : typeof graphiql === "string"
    ? graphiql
    : undefined;
  return playgroundEndpoint;
}

function requestIsForPlayground(
  graphiql: GraphiQLValue,
  request: Drash.Request,
): false | string {
  const playgroundEndpoint = getPlaygroundEndpoint(graphiql);
  if (
    playgroundEndpoint && request.method === "GET" &&
    (request.headers.get("Accept")?.includes("text/html") ||
      request.headers.get("Accept")?.includes("*/*"))
  ) {
    return playgroundEndpoint;
  }
  return false;
}

function handleRequestForPlayground(
  playgroundEndpoint: string,
  response: Drash.Response,
) {
  response.headers.set("Content-Type", "text/html");
  response.html(renderPlaygroundPage({ endpoint: playgroundEndpoint }));
}

async function executeRequest(
  options: GraphQLOptions,
  request: Drash.Request,
  response: Drash.Response,
): Promise<void> {
  const body = request.bodyAll() as Record<string, unknown>;
  console.log(body)
  const query = Object.keys(body)[0]; // Because drash by default will parse body as application www form url encoded, so the `body` looks like `{ "{ hello }": undefined }`, which is not the correct format
  const result = await graphql(
    options.schema,
    query,
    options.rootValue,
  ) as ExecutionResult;
  console.log(result)
  if ("errors" in result) {
    throw new Drash.Errors.HttpError(400, "Malformed request body");
  }
  return response.json(result);
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
      console.log('service called')
    const playgroundEndpoint = requestIsForPlayground(
      this.#options.graphiql,
      request,
    );
    if (playgroundEndpoint) {
        console.log('is for playground endpoint')
      return handleRequestForPlayground(playgroundEndpoint, response);
    }

    if (!["PUT", "POST", "PATCH"].includes(request.method)) {
        console.log('method not allowed')
      throw new Drash.Errors.HttpError(405, "Method Not Allowed");
    }
    console.log('executing')

    await executeRequest(this.#options, request, response);
  }
}

//await graphql(schema, "{ hello }", root)
//curl -X POST localhost:1337/graphql -d '{ hello }'
