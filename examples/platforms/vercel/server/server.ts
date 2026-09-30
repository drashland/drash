import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";
import type { RequestMethod } from "@drashland/drash/core/Types.js";
import { createServer, IncomingMessage, ServerResponse } from "node:http";

type NodeContext = {
  url: string;
  method: RequestMethod;
  request: IncomingMessage;
  response: ServerResponse;
};

class Home extends Resource {
  paths = ["/"];

  GET(context: NodeContext) {
    context.response.end("Oh so easy");
  }
}

const app = Application
  .builder()
  .resources(Home)
  .build();

const server = createServer((request, response) => {
  const context = {
    url: `http://${request.headers.host ?? "localhost"}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return app
    .handle(context)
    .catch((error) => {
      response.statusCode = 500;
      response.statusMessage = "Internal Server Error";
      response.end("Sorry, but we hit an error!");
    });
});

server.listen(Number(process.env.PORT ?? 3000));
