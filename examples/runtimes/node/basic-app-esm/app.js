import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";
import { createServer } from "node:http";

class Home extends Resource {    // Create a resource.
  paths = ["/"];                 // Tell it which path(s) it answers to.

  GET(context) {                 // Node hands you the context object, not a Request.
    console.log(`Received request: ${context.request.url}`);
    context.response.end(        // Write straight to Node's ServerResponse.
      `Oh so easy (written at ${new Date()})`,
    );
  }
}

const app = Application
  .builder()                     // Get the app's builder so we can build the app easily.
  .resources(Home)               // Add the `Home` resource to the app.
  .build();                      // Build the app.

const hostname = "localhost";    // Define server variables for reuse below.
const port = 1447;

const server = createServer((request, response) => {
  // Node's `node:http` gives you `IncomingMessage` and `ServerResponse`, not
  // a Web `Request`. Drash does not convert them for you — you hand the application
  // a context object carrying whatever your resources need. The chain itself
  // only requires `url` and `method`.
  const context = {
    url: `http://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return app                   // Let the app
    .handle(context)             // handle the context object, and
    .catch((error) => {          // catch anything it throws.
      if (context.url.includes("favicon")) {
        return response.end();   // Browsers ask for this; ignore it.
      }

      console.log(`Request URL hit an error: ${context.url}:\n`);
      console.log({ error });

      response.statusCode = 500; // Everything else gets a 500.
      response.statusMessage = "Internal Server Error";
      response.end("Sorry, but we hit an error!");
    });
});

// Start the server.
server.listen(port, hostname, () => {
  console.log(`\nDrash running at http://${hostname}:${port}`);
});
