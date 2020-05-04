/**
 *  Server running with different configs, specifically using
 *  `template_engine` compared to server one
 */

import { Drash } from "../mod.ts";
import ViewResource from "./view_resource.ts";

const server = new Drash.Http.Server({
  directory: Deno.realPathSync("./"),
  resources: [
    ViewResource,
  ],
  static_paths: ["/public"],
  views_path: "./public/views",
  template_engine: true,
});

await server.run({
  hostname: "localhost",
  port: 1667,
});

console.log(`Server listening: http://${server.hostname}:${server.port}`);
