import {
  Chain,
  Resource,
} from "@drashland/drash/modules/chains/RequestChain/mod.polyfill";
import type { RequestMethod } from "@drashland/drash/core/Types";
import { createServer, IncomingMessage, ServerResponse } from "node:http";

type NodeContext = {
  url: string;
  method: RequestMethod;
  request: IncomingMessage;
  response: ServerResponse;
};

// Create a resource
class Home extends Resource {
  paths = ["/"];

  GET(context: NodeContext) {
    console.log(`Received request: ${context.request.url}`);
    context.response.end(`Hello from Home.GET()! (written at ${new Date()})`);
  }
}

// Build the chain and add the resource
const chain = Chain
  .builder()
  .resources(Home)
  .build();

// Define server variables for reuse below
const hostname = "localhost";
const port = 1447;

// Create the server
const server = createServer((request, response) => {
  // Create a context object that the resource can use to access to access the
  // request and response objects.
  //
  // The chain requires the `url` and `method` fields, they are are included.
  const context = {
    url: `http://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  // Pass the context object to the chain
  return chain
    .handle(context)
    .catch((error) => {
      if (context.url.includes("favicon")) {
        return response.end();
      }

      console.log(`Request URL hit an error: ${context.url}:\n`);
      console.log({ error });
      response.statusCode = 500;
      response.statusMessage = "Internal Server Error";
      response.end("Sorry, but we hit an error!");
    });
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`\nDrash running at http://${hostname}:${port}`);
});
