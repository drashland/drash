import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.native.js";

class Home extends Resource {    // Create a resource.
  paths = ["/"];                 // Tell it which path(s) it answers to.

  GET(request) {                 // Handle GET requests to those paths.
    console.log(`Received request: ${request.url}`);

    return new Response(         // This is what `app.handle()` resolves with.
      `Oh so easy (written at ${new Date()})`,
    );
  }
}

const app = Application
  .builder()                     // Get the app's builder so we can build the app easily.
  .resources(Home)               // Add the `Home` resource to the app.
  .build();                      // Build the app.

// Cloudflare requires a default export with a `fetch` function on it. Write
// this as `async fetch(request)` if you need `await` inside it.
export default {
  fetch(request) {               // Handle every request Cloudflare routes here.
    return app                 // Let the app
      .handle(request)           // handle the request, and
      .catch((error) => {        // catch anything it throws.
        if (request.url.includes("favicon")) {
          return new Response(); // Browsers ask for this; ignore it.
        }

        console.log(`Request URL hit an error: ${request.url}:\n`);
        console.log({ error });

        return new Response(     // Everything else gets a 500.
          "Sorry, but we hit an error!",
          {
            status: 500,
            statusText: "Internal Server Error",
          },
        );
      });
  },
};
