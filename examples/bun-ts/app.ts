import {
  Chain,
  Resource,
} from "@drashland/drash/modules/chains/RequestChain/mod.polyfill.js";

// Create a resource
class Home extends Resource {
  paths = ["/"];

  GET(request: Request) {
    console.log(`Received request: ${request.url}`);
    return new Response(
      `Hello from Home.GET()! (written at ${new Date()})`,
    );
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

// Create and start the server
Bun.serve({
  hostname,
  port,
  fetch: (request: Request): Promise<Response> => {
    // Pass the request to the chain
    return chain
      .handle<Response>(request)
      .catch((error) => {
        if (request.url.includes("favicon")) {
          return new Response();
        }

        return new Response(
          "Sorry, but we hit an error!",
          {
            status: 500,
            statusText: "Internal Server Error",
          },
        );
      });
  },
});
