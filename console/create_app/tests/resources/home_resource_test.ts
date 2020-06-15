import { Drash } from "../../deps.ts";
import { assertEquals } from "../../deps.ts";
import HomeResource from "../../resources/home_resource.ts";

const server = new Drash.Http.Server({
  response_output: "application/json",
  resources: [
    HomeResource,
  ],
});

server.run({
  hostname: "localhost",
  port: 1557,
});
console.log(`Server listening: http://${server.hostname}:${server.port}`);

Deno.test({
  name: "HomeResource - GET /",
  async fn(): Promise<void> {
    const response = await fetch("http://localhost:1557");
    assertEquals(response.status, 200);
  },
});

Deno.test({
  name: "Stop the server",
  async fn() {
    await server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
