import {
  Chain,
  Resource,
} from "https://esm.sh/@drashland/drash/modules/chains/RequestChain/mod.native.js";

// import {
//   Chain,
//   Resource,
// } from "npm:@drashland/drash/modules/chains/RequestChain/mod.native.js";

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
Deno.serve({
  hostname,
  port,
  onListen: ({ hostname, port }) => {
    console.log(`\nDrash running at http://${hostname}:${port}`);
  },
  handler: (request: Request): Promise<Response> => {
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
