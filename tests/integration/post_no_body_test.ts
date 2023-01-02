import { assertEquals, TestHelpers } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class PostNoBodyResource extends Resource {
  paths = ["/post-no-body"];

  public POST(_request: Request, response: Response) {
    response.text("POST request received!");
  }
}

const server = new Server({
  resources: [
    PostNoBodyResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("post_no_body_test.ts", async (t) => {
  await t.step("POST /post-no-body", async (t) => {
    /**
     * See the following for reasons why this test was added:
     *
     *   - https://github.com/drashland/drash/pull/691
     */
    await t.step("Does not throw if a body is not defined", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.post(
        "http://localhost:3000/post-no-body",
      );
      const text = await response.text();
      await server.close();
      assertEquals(
        text,
        "POST request received!",
      );
    });
  });
});
