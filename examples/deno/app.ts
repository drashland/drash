import {
  Application,
  Resource,
} from "jsr:@drashland/drash/modules/http.native";

// import {
//   Application,
//   Resource,
// } from "npm:@drashland/drash/modules/http.native.js";

class Home extends Resource {       // Create a resource.
  override paths = ["/"];           // Tell it which path(s) it answers to.

  override GET(request: Request) {  // Handle GET requests to those paths.
    console.log(`Received request: ${request.url}`);

    return new Response(            // This is what `app.handle()` resolves with.
      `Oh so easy (written at ${new Date()})`,
    );
  }
}

const app = Application
  .builder()                        // Get the app's builder so we can build the app easily.
  .resources(Home)                  // Add the `Home` resource to the app.
  .build();                         // Build the app.

const hostname = "localhost";       // Define server variables for reuse below.
const port = 1447;

Deno.serve({
  hostname,
  port,
  onListen: ({ hostname, port }) => {
    console.log(`\nDrash running at http://${hostname}:${port}`);
  },
  handler: (request: Request): Promise<Response> => {
    return app                 // Let the app
      .handle<Response>(request) // handle the request, and
      .catch((error) => {        // catch anything it throws.
        if (request.url.includes("favicon")) {
          return new Response(); // Browsers ask for this; ignore it.
        }

        return new Response(     // Everything else gets a 500.
          "Sorry, but we hit an error!",
          {
            status: 500,
            statusText: "Internal Server Error",
          },
        );
      });
  },
});
