/**
 *  Server running with different configs, specifically using
 *  `template_engine` compared to server one
 */

import Drash from "../mod.ts";
import ViewResource from "./view_resource.ts";

const serverTwo = new Drash.Http.Server({
  address: "localhost:1447",
  directory: Deno.realpathSync("./"),
  resources: [
    ViewResource,
  ],
  static_paths: ["/public"],
  views_path: "./public/views",
  template_engine: true,
});

export default serverTwo;
