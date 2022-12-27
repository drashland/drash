import { assertEquals, Drash, TestHelpers } from "../../deps.ts";
import { ResourceLoaderService } from "../../../../../services/deno/resource_loader/resource_loader.ts";

async function runServer(
  port: number,
): Promise<TestHelpers.DrashServer> {
  const resourceLoader = new ResourceLoaderService({
    paths_to_resources: [
      "./tests/integration/deno/services/resource_loader/resources/api",
      "./tests/integration/deno/services/resource_loader/resources/ssr",
    ],
  });

  const NativeRequestHandler = await Drash.createRequestHandler({
    services: [resourceLoader],
  });

  const denoRequestHandler = (request: Request) => {
    return NativeRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(port)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("resource_loader_test.ts", async (t) => {
  await t.step("GET /home", async (t) => {
    await t.step("should return the homepage", async () => {
      const server = await runServer(3000);
      const res = await fetch(`${server.address}/home`);
      await server.close();
      const actual = await res.text();
      assertEquals(res.status, 200);
      assertEquals(res.headers.get("content-type"), "text/html");
      assertEquals(actual, "<div>Homepage</div>");
    });
  });

  await t.step("GET /api/users", async (t) => {
    await t.step("should return a users array", async () => {
      const server = await runServer(3001);

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
      assertEquals(resPost.status, 200);
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
