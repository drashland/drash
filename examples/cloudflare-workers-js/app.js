import {
  Chain,
  Resource,
} from "@drashland/drash/modules/chains/RequestChain/mod.native.js";

// Create a resource
class Home extends Resource {
  paths = ["/"];

  GET(request) {
    console.log(`Received request: ${request.url}`);
    return new Response(`Hello from Home.GET()! (written at ${new Date()})`);
  }
}

// Build the chain and add the resource
const chain = Chain
  .builder()
  .resources(Home)
  .build();

// Export the object with the fetch function that Cloudflare requires
export default {
  // This `fetch` function would be written as `async fetch(request)` if you
  // were using `await`
  fetch(request) {
    // Pass the request to the chain
    return chain
      .handle(request)
      .catch((error) => {
        if (request.url.includes("favicon")) {
          return new Response();
        }

        console.log(`Request URL hit an error: ${context.url}:\n`);
        console.log({ error });
        return new Response(
          "Sorry, but we hit an error!",
          {
            status: 500,
            statusText: "Internal Server Error",
          },
        );
      });
  },
};
