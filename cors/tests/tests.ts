import { Drash } from "../../deps.ts";
import { Rhum } from "../../test_deps.ts";

// Middleware
import { CorsMiddleware } from "./../mod.ts";

// Resources
import FailedOptionCorsMiddlewareResource from "./resources/failed_option_cors_middleware_resource.ts";

export const server = new Drash.Http.Server({
  response_output: "application/json",
  middleware: {
    after_request: [
      CorsMiddleware(),
    ],
  },
  resources: [
    FailedOptionCorsMiddlewareResource,
  ],
});

server.run({
  hostname: "localhost",
  port: 3003,
});

console.log(`Server listening: http://${server.hostname}:${server.port}`);
console.log("\nIntegration tests: testing server with middleware.\n");

import "./should_shortcircuits_preflight_requests.ts";

Rhum.run();

Deno.test({
  name: "\b\b\b\b\b     \nStop the server",
  async fn() {
    await server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
