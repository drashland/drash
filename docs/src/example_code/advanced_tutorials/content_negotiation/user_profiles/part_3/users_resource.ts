import Drash from "https://deno.land/x/drash/mod.ts";

export default class UsersResource extends Drash.Http.Resource {

  static paths = [
    "/users/:id",
    "/users/:id/"
  ];

  public GET() {
    let userId = this.request.getPathParam("id");
    this.response.body = this.getUser(userId);
    return this.response;
  }

  protected getUser(userId) {
    try {
      let users = this.readFileContents("./users.json");
      users = JSON.parse(users);
      return users[userId];
    } catch (error) {
      throw new Drash.Exceptions.HttpException(404, `User with ID "${userId}" not found.`);
    }
  }

  protected readFileContents(file: string) {
    let fileContentsRaw = Deno.readFileSync(file);
    const decoder = new TextDecoder();
    let decoded = decoder.decode(fileContentsRaw);
    return decoded;
  }
}
