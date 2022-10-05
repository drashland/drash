import { assert, assertEquals, Drash, TestHelpers } from "../../deps.ts";
import { ETagService } from "../../../../../services/deno/etag/etag.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class ETagResource extends Drash.Resource {
  paths = ["/etag/:name?"];

  public GET(request: Drash.Request, response: Drash.Response) {
    const name = request.pathParam("name") ?? "";
    return response.text("hello " + name);
  }
}

async function runServer(weak = false): Promise<TestHelpers.DrashServer> {
  const drashRequestHandler = await Drash.createRequestHandler({
    resources: [ETagResource],
    services: [new ETagService({ weak })],
  });

  const denoRequestHandler = (request: Request) => {
    return drashRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(3000)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("etag_test.ts", async (t) => {
  await t.step("GET /etag", async (t) => {
    await t.step("Should set the header and default to strong", async () => {
      const strongServer = await runServer();
      // Example browser request
      const response = await fetch(
        `${strongServer.address}/etag`,
      );
      await strongServer.close();
      assertEquals(await response.text(), "hello ");
      const header = response.headers.get("etag") ?? "";
      assert(header.match(/\"\d-.*\"/));
      assert(response.headers.get("last-modified"));
    });
    // await t.step(
    //   "Should set the header and be weak if specified",
    //   async () => {
    //     const weakServer = await runServer(true);
    //     // Example browser request
    //     const response = await fetch(
    //       `${weakServer.address}/etag`,
    //     );
    //     await weakServer.close();
    //     assertEquals(await response.text(), "hello ");
    //     const header = response.headers.get("etag") ?? "";
    //     assert(header.match(/W\/\"\d-.*\"/));
    //     assert(response.headers.get("last-modified"));
    //   },
    // );
    // await t.step(
    //   "Header values stay the same after 2 reqs with same body",
    //   async () => {
    //     const strongServer = await runServer();
    //     // Example browser request
    //     const response1 = await fetch(
    //       `${strongServer.address}/etag`,
    //     );
    //     await response1.text();
    //     const response2 = await fetch(
    //       `${strongServer.address}/etag`,
    //     );
    //     await response2.text();
    //     await strongServer.close();
    //     const lastModified1 = response1.headers.get("last-modified");
    //     const etag1 = response1.headers.get("etag");
    //     const lastModified2 = response1.headers.get("last-modified");
    //     const etag2 = response1.headers.get("etag");
    //     assertEquals(lastModified1, lastModified2);
    //     assertEquals(etag1, etag2);
    //   },
    // );
    // await t.step(
    //   "Header values are different after 2nd req has different body",
    //   async () => {
    //     const strongServer = await runServer();
    //     const response1 = await fetch(
    //       `${strongServer.address}/etag`,
    //     );
    //     await response1.text();
    //     await delay(1500);
    //     const response2 = await fetch(
    //       `${strongServer.address}/etag/edward`,
    //     );
    //     await response2.text();
    //     await strongServer.close();
    //     const lastModified1 = response1.headers.get("last-modified");
    //     const etag1 = response1.headers.get("etag");
    //     const lastModified2 = response2.headers.get("last-modified");
    //     const etag2 = response2.headers.get("etag");
    //     assertNotEquals(lastModified1, lastModified2);
    //     assertNotEquals(etag1, etag2);
    //   },
    // );
  });
});
