import { assertEquals, Drash, TestHelpers } from "../../deps.ts";
import { TengineService } from "../../../../../services/native/tengine/tengine.ts";

// FILE MARKER - APP SETUP /////////////////////////////////////////////////////

const tengine = new TengineService({
  views_path: "./tests/integration/deno/data/views",
});

class TengineResource extends Drash.Resource {
  paths = ["/tengine"];

  services = {
    "GET": [tengine],
  };

  public GET(_request: Drash.Request, response: Drash.Response) {
    response.html(tengine.render("/tengine_index.html", {
      greeting: "Gday",
    }) as string);
    return response;
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [TengineResource],
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

// FILE MARKER - TESTS /////////////////////////////////////////////////////////

Deno.test("tengine_test.ts", async (t) => {
  await t.step("GET /tengine", async (t) => {
    await t.step("Tengine should handle the request", async () => {
      const server = await runServer();
      const res = await fetch(`${server.address}/tengine`);
      await server.close();
      assertEquals(res.headers.get("content-type"), "text/html");
      const html = await res.text();
      assertEquals(html, "<div>Gday</div>");
    });
  });
});
