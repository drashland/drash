import { Drash } from "../../../mod.ts";

import CoffeeResource from "./resources/coffee_resource.ts";

export const server = new Drash.Http.Server({
  response_output: "application/json",
  resources: [
    CoffeeResource,
  ],
});

server.runTLS({
  hostname: "localhost",
  port: 3002,
  certFile: "./tests/integration/app_3_https/server.crt",
  keyFile: "./tests/integration/app_3_https/server.key",
});

console.log(`Server listening: http://${server.hostname}:${server.port}`);
console.log("\nIntegration tests: testing HTTPS server.\n");

import "./coffee_resource_test.ts";

Deno.test({
  name: "\b\b\b\b\b     \nStop the server",
  async fn() {
    await server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
