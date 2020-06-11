/**
 *  Server running with different configs, specifically using
 *  `template_engine` compared to app_1_resources' server
 */

import { Drash } from "../../../mod.ts";
import ViewResource from "./resources/view_resource.ts";
import TemplateEngineResource from "./resources/template_engine_resource.ts";
import TemplateEngineNullDataResource from "./resources/template_engine_null_data_resource.ts";

const server = new Drash.Http.Server({
  resources: [
    TemplateEngineResource,
    TemplateEngineNullDataResource,
    ViewResource,
  ],
  static_paths: ["/public"],
  // TODO
  // (crookse) Figure how to get the path without having to change into the
  // directory
  views_path: "./tests/integration/app_3001_views/public/views",
  template_engine: true,
});

server.run({
  hostname: "localhost",
  port: 3001,
});
console.log(`Server listening: http://${server.hostname}:${server.port}`);
console.log(
  "\nIntegration tests: testing template engine serves text/html responses\n",
);

import "./template_engine_null_data_resource_test.ts";
import "./template_engine_resource_test.ts";
import "./view_resource_test.ts";

Deno.test({
  name: "Stop the server",
  async fn() {
    await server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
