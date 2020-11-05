import { assertEquals } from "../../deps.ts";
import { server } from "../../server.ts";

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
      {
        message: "GET request received!",
      },
    );

    // Stop the server
    await server.close();
  },
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
      {
        message: "POST method not implemented.",
      },
    );

    // Stop the server
    await server.close();
  },
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
      {
        message: "PUT method not implemented.",
      },
    );

    // Stop the server
    await server.close();
  },
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
      {
        message: "DELETE method not implemented.",
      },
    );

    // Stop the server
    await server.close();
  },
});
