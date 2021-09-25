import { Rhum, TestHelpers } from "../deps.ts";
import * as Drash from "../../mod.ts";
import { IContext, Resource } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class UsersResource extends Resource {
  paths = ["/users", "/users/:id"];

  public GET(context: IContext) {
    const userId = context.request.pathParam("id");

    if (!userId) {
      context.response.text("Please specify a user ID.");
      return;
    }

    context.response.text(JSON.stringify(this.getUser(parseInt(userId))));
    return;
  }

  public POST(context: IContext) {
    context.response.text("POST request received!");
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

Rhum.testPlan("users_resource_test.ts", () => {
  Rhum.testSuite("/users", () => {
    Rhum.testCase("user data can be retrieved", async () => {
      server.run();

      let response;
      Deno.chdir("./tests/integration");
      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      Rhum.asserts.assertEquals(
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
      Rhum.asserts.assertEquals(
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
      Rhum.asserts.assertEquals(
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
      Rhum.asserts.assertEquals(
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
      Rhum.asserts.assertEquals(
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
      Rhum.asserts.assertEquals(
        (await response.text()).startsWith(
          `Error: User with ID "18" not found.`,
        ),
        true,
      );

      server.close();
    });
  });
});

Rhum.run();
