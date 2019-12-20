import Drash from "https://deno.land/x/drash/mod.ts";

export default class UsersResource extends Drash.Http.Resource {

  static paths = [
    "/users/:id",
    "/users/:id/"
  ];

  public GET() {
    let userId = this.request.getPathParam("id");
    let user = this.getUser(userId);

    if (!user) {
      throw new Drash.Exceptions.HttpException(404);
    }

    switch (this.request.response_content_type) {
      case "text/html":
        this.response.body = this.generateHtml(user);
        break;
      case "application/json":
      default:
        this.response.body = this.generateJson(user);
        break;
    }

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

  protected generateHtml(user) {
    try {
      let html = this.readFileContents("./user.html");
      html = html
        .replace(/\{\{ alias \}\}/, user.alias)
        .replace(/\{\{ name \}\}/, user.name);
      return html;
    } catch (error) {
      throw new Drash.Exceptions.HttpException(500, error.message);
    }
  }

  protected generateJson(user) {
    user.api_key = "**********";
    user.api_secret = "**********";
    return user;
  }

  protected readFileContents(file: string) {
    let fileContentsRaw = Deno.readFileSync(file);
    const decoder = new TextDecoder();
    let decoded = decoder.decode(fileContentsRaw);
    return decoded;
  }
}

