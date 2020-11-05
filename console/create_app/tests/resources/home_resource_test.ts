import { Drash } from "../../deps.ts";
import { assertEquals } from "../../deps.ts";
import HomeResource from "../../resources/home_resource.ts";

const server = new Drash.Http.Server({
  response_output: "application/json",
  resources: [
    HomeResource,
  ],
});

async function startServer() {
  await server.run({
    hostname: "localhost",
    port: 1557,
  });
}

Deno.test({
  name: "HomeResource - GET /",
  fn: async () => {
    // Start the server
    await startServer();

    // Fetch a response
    const response = await fetch("http://localhost:1557", {
      method: "GET",
    });

    // Make assertions
    assertEquals(response.status, 200);
    assertEquals(
      await response.json(),
      JSON.stringify({
        message: "GET request received!",
      }),
    );

    // Stop the server
    server.close();
  },
    sanitizeResources: false,
    sanitizeOps: false
});


Deno.test({
  name: "HomeResource - POST /",
  fn: async () => {
    // Start the server
    await startServer();

    // Fetch a response
    const response = await fetch("http://localhost:1557", {
      method: "POST",
    });

    // Make assertions
    assertEquals(response.status, 200);
    assertEquals(
      await response.json(),
      JSON.stringify({
        message: "Not implemented",
      }),
    );

    // Stop the server
    server.close();
  },
    sanitizeResources: false,
    sanitizeOps: false
});


Deno.test({
  name: "HomeResource - PUT /",
  fn: async () => {
    // Start the server
    await startServer();

    // Fetch a response
    const response = await fetch("http://localhost:1557", {
      method: "PUT",
    });

    // Make assertions
    assertEquals(response.status, 200);
    assertEquals(
      await response.json(),
      JSON.stringify({
        message: "Not implemented",
      }),
    );

    // Stop the server
    server.close();
  },
    sanitizeResources: false,
    sanitizeOps: false
});

Deno.test({
  name: "HomeResource - DELETE /",
  fn: async () => {
    // Start the server
    await startServer();

    // Fetch a response
    const response = await fetch("http://localhost:1557", {
      method: "DELETE",
    });

    // Make assertions
    assertEquals(response.status, 200);
    assertEquals(
      await response.json(),
      JSON.stringify({
        message: "Not implemented",
      }),
    );

    // Stop the server
    server.close();
  },
    sanitizeResources: false,
    sanitizeOps: false
});
