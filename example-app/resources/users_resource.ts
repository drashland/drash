import Resource from "./resource.ts";

/** Define an HTTP resource that handles HTTP requests to the /users URI */
export default class UsersResource extends Resource {
  static paths = ["/users", "/users/", "/users/:user_id", "/users/:user_id/"];

  protected users = {
    1: {
      name: "Captain America"
    },
    2: {
      name: "Iron Man"
    },
    3: {
      name: "Thor"
    }
  };

  /**
   * Handle GET requests.
   */
  public GET() {
    if (
      this.request.path_params.user_id
      && this.users[this.request.path_params.user_id]
    ) {
      this.response.body = this.users[this.request.path_params.user_id];
    } else {
      this.response.body = this.users;
    }

    return this.response;
  }
}

