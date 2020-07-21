import { Drash } from "../../../mod.ts";

import MiddlewareResource from "./resources/middleware_resource.ts";

export const server = new Drash.Http.Server({
  response_output: "application/json",
  resources: [
    MiddlewareResource,
  ],
});

server.run({
  hostname: "localhost",
  port: 3005,
});

console.log(`Server listening: http://${server.hostname}:${server.port}`);
console.log("\nIntegration tests: testing server with middleware.\n");

import "./middleware_resource_test.ts";

Deno.test({
  name: "\b\b\b\b\b     \nStop the server",
  fn() {
    server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
