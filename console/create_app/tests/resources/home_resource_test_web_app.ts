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
      await response.text(),
      '<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset="utf-8">\n        <meta name="viewport" content="width=device-width, initial-scale=1">\n        <script src="/public/js/index.js"></script>\n        <link rel="stylesheet" href="/public/css/index.css">\n        <title>Drash - Create App</title>\n    </head>\n    <body>\n        <main>\n            <h1>Welcome</h1>\n            <p>Welcome to your new application, start building something great with Drash!</p>\n        </main>\n    </body>\n</html>',
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
      await response.text(),
      "POST method not implemented.",
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
      await response.text(),
      "PUT method not implemented.",
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
      await response.text(),
      "DELETE method not implemented.",
    );

    // Stop the server
    await server.close();
  },
});
