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
     * This bug was discovered by sending no body ina post request.
     *
     * The fix was to remove the `#original_request` on `request.ts` as we cloned it,
     * no body seemed to not be caught by the native code, but we didn't need it anyway.
     */
    await t.step("Does not throw if a body isnt defined", async () => {
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
