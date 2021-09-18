import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class UsersResource extends Drash.DrashResource {
  static paths = ["/users", "/users/:id"];

  public GET() {
    const userId = this.request.pathParam("id");

    if (!userId) {
      this.response.body = "Please specify a user ID.";
      return this.response;
    }

    this.response.body = this.getUser(parseInt(userId));
    return this.response;
  }

  public POST() {
    this.response.body = "POST request received!";
    return this.response;
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
    let fileContentsRaw = Deno.readFileSync(file);
    const decoder = new TextDecoder();
    let decoded = decoder.decode(fileContentsRaw);
    return decoded;
  }
}

const server = new Drash.Server({
  resources: [
    UsersResource,
  ],
  protocol: "http"
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("users_resource_test.ts", () => {
  Rhum.testSuite("/users", () => {
    Rhum.testCase("user data can be retrieved", async () => {
      server.run();

      let response;
      Deno.chdir("./tests/integration/app_3000_resources");
      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a user ID."',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users/",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a user ID."',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users//",
      );
      Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users/17",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '{"id":17,"name":"Thor"}',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users/17/",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '{"id":17,"name":"Thor"}',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/users/18",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        `\"User with ID \\\"18\\\" not found.\"`,
      );

      server.close();
    });
  });
});

Rhum.run();
