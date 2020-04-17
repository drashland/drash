import { Drash } from "../mod.ts";

export default class UsersResource extends Drash.Http.Resource {
  static paths = ["/users", "/users/:id"];

  public GET() {
    const userId = this.request.getPathParam("id");

    if (!userId) {
      this.response.body = "Please specify a user ID.";
      return this.response;
    }

    this.response.body = this.getUser(userId);
    return this.response;
  }

  public POST() {
    this.response.body = "POST request received!";
    return this.response;
  }

  protected getUser(userId: number) {
    let user = null;

    try {
      let users = this.readFileContents("./users.json");
      users = JSON.parse(users);
      user = users[userId];
    } catch (error) {
      throw new Drash.Exceptions.HttpException(
        400,
        `Error getting user with ID "${userId}". Error: ${error.message}.`,
      );
    }

    if (!user) {
      throw new Drash.Exceptions.HttpException(
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
