import { assertEquals, Drash, TestHelpers } from "../../deps.ts";

// FILE MARKER - APP SETUP /////////////////////////////////////////////////////

// Default resource to add to the server (all tests should be able to see this resource)
class DefaultResource extends Drash.Resource {
  paths = ["/"];
  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.text("Hello from DefaultResource");
  }
}

// This resource should be added when `ServerService` is plugged into the server
class AddedResource extends Drash.Resource {
  public paths = ["/added-resource"];

  public GET(request: Drash.Request, response: Drash.Response) {
    const queryParam = request.queryParam("some_query_param");
    if (queryParam) {
      return response.text(
        `Hello from AddedResource. You passed in a "some_query_param" value: ${queryParam}`,
      );
    }

    return response.text(
      "Hello from AddedResource. You did not pass in a query param.",
    );
  }
}

// This service should add `AddedResource` to the server
class ServerService implements Drash.Interfaces.Service {
  runAtStartup(options: Drash.Types.ContextForServicesAtStartup) {
    const { addResources } = options;
    addResources([AddedResource]);
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [DefaultResource], // `AddedResource` is not present, but it should exist when `ServerService` is instantiated
    services: [new ServerService()],
  });

  const denoRequestHandler = (request: Request) => {
    return NativeRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(1234)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

/**
 * Get the fully qualified URL given the URI.
 *
 * @param uri - The URI to add to the serverURL.
 * @returns The fully qualified URL.
 */
function url(server: TestHelpers.DrashServer, uri: string): string {
  return server.address + uri;
}

// FILE MARKER - TESTS /////////////////////////////////////////////////////////

Deno.test("ServerService should add AddedResource at startup", async () => {
  const server = await runServer();

  // Assert that the `DeafultResource` is accessible
  const res1 = await fetch(url(server, "/"));
  const res1Text = await res1.text();
  assertEquals(res1Text, "Hello from DefaultResource");

  // Assert that the `AddedResource` is accessible since `ServerService` added it
  const res2 = await fetch(url(server, "/added-resource"));
  const res2Text = await res2.text();
  assertEquals(
    res2Text,
    "Hello from AddedResource. You did not pass in a query param.",
  );

  // Assert (for sanity check) that `AddedResource` takes query params as expected
  const res3 = await fetch(url(server, "/added-resource?some_query_param=sup"));
  const res3Text = await res3.text();
  assertEquals(
    res3Text,
    `Hello from AddedResource. You passed in a "some_query_param" value: sup`,
  );

  // Assert (for sanity check) that `AddedResource` works with other query param values as expected
  const res4 = await fetch(
    url(server, "/added-resource?some_query_param=anotha one"),
  );
  const res4Text = await res4.text();
  assertEquals(
    res4Text,
    `Hello from AddedResource. You passed in a "some_query_param" value: anotha one`,
  );

  await server.close();
});
