import { assert, delay, Drash, TestHelpers } from "../../deps.ts";
import { ResponseTimeService } from "../../../../../services/native/response_time/response_time.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class ResponseTimeResource extends Drash.Resource {
  paths = ["/response-time"];

  public async GET(_request: Drash.Request) {
    await delay(400);
    return TestHelpers.responseBuilder().text("hello").build();
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [
      ResponseTimeResource,
    ],
    services: [new ResponseTimeService()],
  });

  const denoRequestHandler = (request: Request) => {
    return NativeRequestHandler.handle(request);
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

Deno.test("response_time_test.ts", async (t) => {
  await t.step("GET /response-time", async (t) => {
    await t.step("Should set the response time header", async () => {
      const server = await runServer();
      // Example browser request
      const response = await fetch(
        `${server.address}/response-time`,
      );
      await response.text();
      await server.close();
      const value = response.headers.get("x-response-time") ?? "";
      assert(value.match(/\d\d\dms/));
    });
  });
});
