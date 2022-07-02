import { assertEquals, Drash } from "../../../deps.ts";
import { ResourceLoaderService } from "../../../../src/services/resource_loader/resource_loader.ts";

/**
 * Helper function to start the server in a test that can close it to prevent
 * leaking async ops. The server needs to start and stop in the same test.
 * @returns The server so it can be closed in the test.
 */
async function startServer(port: number) {
  const resourceLoader = new ResourceLoaderService({
    paths_to_resources: [
      "./tests/integration/services/resource_loader/resources/api",
      "./tests/integration/services/resource_loader/resources/ssr",
    ],
  });

  const server = new Drash.Server({
    protocol: "http",
    hostname: "localhost",
    port: port,
    services: [
      resourceLoader,
    ],
  });

  await server.run();

  return server;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("resource_loader_test.ts", async (t) => {
  await t.step("GET /home", async (t) => {
    await t.step("should return the homepage", async () => {
      const server = await startServer(3000);
      const res = await fetch(`${server.address}/home`);
      await server.close();
      const actual = await res.text();
      assertEquals(res.headers.get("content-type"), "text/html");
      assertEquals(actual, "<div>Homepage</div>");
    });
  });

  await t.step("GET /api/users", async (t) => {
    await t.step("should return a users array", async () => {
      const server = await startServer(3001);

      const resGet = await fetch(`${server.address}/api/users`);
      assertEquals(resGet.headers.get("content-type"), "application/json");
      assertEquals(await resGet.json(), [
        {
          id: 1,
          name: "Ed",
        },
        {
          id: 2,
          name: "Breno",
        },
      ]);

      const resPost = await fetch(`${server.address}/api/users`, {
        method: "POST",
      });
      assertEquals(resPost.headers.get("content-type"), "application/json");
      assertEquals(await resPost.json(), [
        {
          id: 1,
          name: "Eric",
        },
        {
          id: 2,
          name: "Sara",
        },
      ]);

      await server.close();
    });
  });
});
