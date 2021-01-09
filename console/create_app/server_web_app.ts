import { Drash } from "./deps.ts";
import HomeResource from "./resources/home_resource.ts";

export const server = new Drash.Http.Server({
  directory: Deno.realPathSync("."),
  response_output: "text/html",
  logger: new Drash.CoreLoggers.ConsoleLogger({
    enabled: false,
    level: "debug",
  }),
  resources: [
    HomeResource,
  ],
  static_paths: ["/public"],
});
