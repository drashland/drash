import {
  Interfaces,
  Request,
  Resource,
  Response,
  Server,
  Service,
} from "../../mod.ts";
import { assertEquals } from "../deps.ts";

// Default resource to add to the server (all tests should be able to see this resource)
class DefaultResource extends Resource {
  paths = ["/"];
  public GET(_request: Request, response: Response) {
    response.text("Hello from DefaultResource");
  }
}

// This resource should be added when `ServerService` is plugged into the server
class AddedResource extends Resource {
  public paths = ["/added-resource"];

  public GET(request: Request, response: Response): void {
    const queryParam = request.queryParam("some_query_param");
    if (queryParam) {
      return response.text(
        `Hello from AddedResource. You passed in a "some_query_param" value: ${queryParam}`,
      );
    }

    response.text(
      "Hello from AddedResource. You did not pass in a query param.",
    );
  }
}

// This service should add `AddedResource` to the server
class ServerService extends Service {
  runAtStartup(options: Interfaces.IServiceStartupOptions) {
    const { server } = options;
    server.addResource(AddedResource);
  }
}

/**
 * Get the fully qualified URL given the URI.
 *
 * @param uri - The URI to add to the serverURL.
 * @returns The fully qualified URL.
 */
function url(server: Server, uri: string): string {
  return server.address + uri;
}

Deno.test("ServerService should add AddedResource at startup", async () => {
  const server = new Server({
    protocol: "http",
    port: 1234,
    hostname: "localhost",
    // `AddedResource` is not present, but it should exist when `ServerService` is instantiated
    resources: [DefaultResource],
    services: [new ServerService()],
  });

  server.run();

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
