import Drash from "../mod.ts";
// Resources
import CoffeeResource from "./coffee_resource.ts";
import CookieResource from "./cookie_resource.ts";
import FilesResource from "./files_resource.ts";
import HomeResource from "./home_resource.ts";
import MiddlewareResource from "./middleware_resource.ts";
import UsersResource from "./users_resource.ts";
import ViewResource from "./view_resource.ts";
import TemplateEngineResource from "./template_engine_resource.ts";
import TemplateEngineNullDataResource from "./template_engine_null_data_resource.ts";
import RequestAcceptsResource from "./request_accepts_resource.ts";

// Middleware
import Middleware from "./middleware.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
  directory: Deno.realpathSync("./"),
  response_output: "application/json",
  logger: new Drash.CoreLoggers.ConsoleLogger({
    enabled: false,
    level: "debug",
  }),
  middleware: {
    resource_level: [
      Middleware,
    ],
  },
  memory_allocation: {
    multipart_form_data: 128,
  },
  pretty_links: true,
  resources: [
    CoffeeResource,
    CookieResource,
    FilesResource,
    HomeResource,
    MiddlewareResource,
    TemplateEngineResource,
    TemplateEngineNullDataResource,
    UsersResource,
    ViewResource,
    RequestAcceptsResource,
  ],
  static_paths: ["/public"],
  views_path: "./public/views",
});

export default server;
