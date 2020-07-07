import { Drash } from "../../../mod.ts";
import { Rhum } from "../../deps.js";

import CoffeeResource from "./resources/coffee_resource.ts";
import CookieResource from "./resources/cookie_resource.ts";
import FilesResource from "./resources/files_resource.ts";
import HomeResource from "./resources/home_resource.ts";
import RequestAcceptsResource from "./resources/request_accepts_resource.ts";
import RequestAcceptsTwoResource from "./resources/request_accepts_two_resource.ts";
import UsersResource from "./resources/users_resource.ts";

export const server = new Drash.Http.Server({
  response_output: "application/json",
  memory_allocation: {
    multipart_form_data: 128,
  },
  resources: [
    CoffeeResource,
    CookieResource,
    FilesResource,
    HomeResource,
    RequestAcceptsResource,
    RequestAcceptsTwoResource,
    UsersResource,
  ],
});

server.run({
  hostname: "localhost",
  port: 3000,
});
console.log(`Server listening: http://${server.hostname}:${server.port}`);
console.log(
  "\nIntegration tests: testing different resources can be made and targeted.\n",
);

import "./home_resource_test.ts";
import "./request_accepts_resource_test.ts";
import "./request_accepts_two_resource_test.ts";
import "./coffee_resource_test.ts";
import "./cookie_resource_test.ts";
import "./files_resource_test.ts";
import "./users_resource_test.ts";

Deno.test({
  name: "\b\b\b\b\b     \nStop the server",
  async fn() {
    await server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
