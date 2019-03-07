import Drash from "https://deno.land/x/drash/mod.ts";

/**
 * Create an HTTP resource that handles HTTP requests to the /users/:id URI
 */
export default class UsersResource extends Drash.Http.Resource {
  /**
   * Define the paths (a.k.a. URIs) that clients can use to access this resource.
   */
  static paths = ["/users/:id", "/users/:id/"];

  /**
   * Define a list of users this resource contains since we're not using a database.
   */
  protected users = {
    1: {
      id: 1,
      alias: "Captain America",
      name: "Steve Rogers",
      api_key: "46096ec9-5bf9-4978-b77b-07018dc32a74",
      api_secret: "1b64d3ac-7e19-4018-ab99-29f50e097f4b",
    },
    2: {
      id: 2,
      alias: "Iron Man",
      name: "Tony Stark",
      api_key: "3d93a3f9-c5ad-439d-bacb-75a9e4fb2b42",
      api_secret: "e5b11faa-629f-4255-bf3a-ee736dc9468d",
    },
    3: {
      id: 3,
      alias: "Thor",
      name: "Thor Odinson",
      api_key: "7442f354-2a89-47ef-a3ce-5a7c68e82157",
      api_secret: "365e362f-fa21-4e5a-bb84-9da76e1c5f49",
    }
  };

  /**
   * Handle GET requests.
   */
  public GET() {
    let userId = this.request.path_params.id;
    let user = this.users[userId];

    if (!user) {
      throw new Drash.Exceptions.HttpException(404, "User not found.");
    }

    switch (this.response.headers.get("Content-Type")) {

      case "application/json":
        // Simulate authentication
        if (this.request.url_query_params.auth_token != "shield") {
          delete user.id;
          delete user.name;
          delete user.api_key;
          delete user.api_secret;
        }
        this.response.body = user;
        break;

      case "text/html":
        this.response.body = `<div class="m-8 max-w-sm rounded overflow-hidden shadow-lg">
<img class="w-full" src="https://images.bewakoof.com/original/avengers-logos-mini-backpack-avl-essential-printed-mini-backpacks-183193-1524728878.jpg" alt="Avengers">
<div class="px-6 py-4">
  <div class="font-bold text-xl mb-4">${user.alias}</div>`;
        // Simulate authentication
        if (this.request.url_query_params.auth_token == "shield") {
          this.response.body += `<div class="flex mb-4">
    <div class="w-1/2">ID</div>
    <div class="w-1/2">${user.id}</div>
  </div>
  <div class="flex mb-4">
    <div class="w-1/2">Alias</div>
    <div class="w-1/2">${user.name}</div>
  </div>
  <div class="flex mb-4">
    <div class="w-1/2">API Key</div>
    <div class="w-1/2">${user.api_key}</div>
  </div>
  <div class="flex mb-4">
    <div class="w-1/2">API Secret</div>
    <div class="w-1/2">${user.api_secret}</div>
  </div>
</div>`;
        } else {
          this.response.body += `<div class="flex mb-4">
  <div>Please log in to view this profile.</div>
</div>`;
        }
        break;
    }

    return this.response;
  }
}

