import { assertEquals, Drash, TestHelpers } from "../deps.ts";

// FILE MARKER - APP SETUP /////////////////////////////////////////////////////

class UsersResource extends Drash.Resource {
  paths = ["/users", "/users/:id"];

  public GET(request: Drash.Request, response: Drash.Response) {
    const userId = request.pathParam("id");

    if (!userId) {
      return response.text("Please specify a user ID.");
    }

    return response.text(JSON.stringify(this.getUser(parseInt(userId))));
  }

  public POST(_request: Drash.Request, response: Drash.Response) {
    return response.text("POST request received!");
  }

  protected getUser(userId: number) {
    let user = null;

    try {
      let users = this.readFileContents(
        "users.json",
      );
      users = JSON.parse(users);
      user = users[userId];
    } catch (error) {
      throw new Drash.Errors.HttpError(
        400,
        `Error getting user with ID "${userId}". Error: ${error.message}.`,
      );
    }

    if (!user) {
      throw new Drash.Errors.HttpError(
        404,
        `User with ID "${userId}" not found.`,
      );
    }

    return user;
  }

  protected readFileContents(file: string) {
    const fileContentsRaw = Deno.readFileSync(file);
    const decoder = new TextDecoder();
    const decoded = decoder.decode(fileContentsRaw);
    return decoded;
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [UsersResource],
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

Deno.test("users_resource_test.ts", async (t) => {
  await t.step("/users", async (t) => {
    await t.step("user data can be retrieved", async () => {
      const server = await runServer();

      let response;
      const currentDir = Deno.cwd();
      Deno.chdir("./tests/integration/deno/drash_request");
      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        await response.text(),
        "Please specify a user ID.",
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users/",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        await response.text(),
        "Please specify a user ID.",
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users//",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users/17",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        await response.text(),
        '{"id":17,"name":"Thor"}',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users/17/",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        await response.text(),
        '{"id":17,"name":"Thor"}',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users/18",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        (await response.text()).startsWith(
          `Error: User with ID "18" not found.`,
        ),
        true,
      );

      // Change back to what the current working directory was so that other
      // tests that try to open files use the current working directory and
      // not "./tests/integration".
      Deno.chdir(currentDir);
      await server.close();
    });
  });
});
