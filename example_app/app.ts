import Drash from "../mod.ts";
import FilesResource from "./files_resource.ts";
import HomeResource from "./home_resource.ts";
import UsersResource from "./users_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
  response_output: "application/json",
  memory_allocation: {
    multipart_form_data: 128
  },
  resources: [
    FilesResource,
    HomeResource,
    UsersResource,
  ],
});

server.run();
