import { Drash } from "../../../mod.ts";

// Resources
import HeaderTokenMiddlewareResource from "./resources/header_token_middleware_resource.ts";

// Middleware
import HeaderTokenMiddleware from "./middleware/header_token_middleware.ts";

export const server = new Drash.Http.Server({
  response_output: "application/json",
  middleware: {
    before_request: [
      HeaderTokenMiddleware
    ]
  },
  resources: [
    HeaderTokenMiddlewareResource,
  ],
});

server.run({
  hostname: "localhost",
  port: 3003
});

console.log(`Server listening: http://${server.hostname}:${server.port}`);
console.log("\nIntegration tests: testing server with middleware.\n");

import "./header_token_middleware_resource_test.ts";

Deno.test({
  name: "Stop the server",
  async fn() {
    await server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
