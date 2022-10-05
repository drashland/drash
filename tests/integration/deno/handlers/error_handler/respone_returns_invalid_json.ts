/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { assertEquals, Drash, TestHelpers } from "../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class Res extends Drash.Resource {
  paths = ["/"];

  public async POST(request: Drash.Request, response: Drash.Response) {
    const body = await request.readBody<{ name: string }>("json");
    return response.text(body.name ?? "");
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const drashRequestHandler = await Drash.createRequestHandler({
    resources: [Res],
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

Deno.test("posting_invlaid_json_test.ts", async (t) => {
  await t.step("POST /", async (t) => {
    await t.step("Should return error when json body is invalid", async () => {
      const server = await runServer();
      const response = await fetch(
        server.address,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"name": "ed"}},,',
        },
      );
      await server.close();
      const text = await response.text();
      assertEquals(
        text.includes("Unexpected non-whitespace character after JSON"),
        true,
      );
      assertEquals(response.status, 500);
    });
  });
});
