import { Drash } from "../mod.ts";
import server from "./app_server.ts";

server.run({
  hostname: "localhost",
  port: 1667,
});
