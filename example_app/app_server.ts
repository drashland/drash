import Drash from "../mod.ts";
// Resources
import CoffeeResource from "./coffee_resource.ts";
import CookieResource from "./cookie_resource.ts";
import FilesResource from "./files_resource.ts";
import HomeResource from "./home_resource.ts";
import MiddlewareResource from "./middleware_resource.ts";
import UsersResource from "./users_resource.ts";
// Middleware
import Middleware from "./middleware.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
  response_output: "application/json",
  middleware: {
    resource_level: [
      Middleware,
    ],
  },
  memory_allocation: {
    multipart_form_data: 128,
  },
  resources: [
    CoffeeResource,
    CookieResource,
    FilesResource,
    HomeResource,
    MiddlewareResource,
    UsersResource,
  ],
});

export default server;
