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

Deno.test("HomeResource - GET /", async () => {
  const response = await fetch("http://localhost:1557", {
    method: "POST",
  });
  assertEquals(response.status, 200);
  assertEquals(
    await response.json(),
    JSON.stringify({
      message: "Not implemented",
    }),
  );
});

Deno.test({
  name: "\b\b\b\b\b     \nStop the server",
  async fn() {
    await server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
