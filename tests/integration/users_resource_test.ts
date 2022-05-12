import { assertEquals, TestHelpers } from "../deps.ts";
import * as Drash from "../../mod.ts";
import { Request, Resource, Response } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class UsersResource extends Resource {
  paths = ["/users", "/users/:id"];

  public GET(request: Request, response: Response) {
    const userId = request.pathParam("id");

    if (!userId) {
      response.text("Please specify a user ID.");
      return;
    }

    response.text(JSON.stringify(this.getUser(parseInt(userId))));
    return;
  }

  public POST(_request: Request, response: Response) {
    response.text("POST request received!");
    return;
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

const server = new Drash.Server({
  resources: [
    UsersResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("users_resource_test.ts", async (t) => {
  await t.step("/users", async (t) => {
    await t.step("user data can be retrieved", async () => {
      server.run();

      let response;
      const currentDir = Deno.cwd();
      Deno.chdir("./tests/integration");
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
