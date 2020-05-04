import { Drash } from "../mod.ts";
import server from "./app_server.ts";

server.runTLS({
  hostname: "localhost",
  port: 1447,
  certFile: "./tls/server.crt",
  keyFile: "./tls/server.key",
});

console.log(`Server listening: https://${server.hostname}:${server.port}`);
