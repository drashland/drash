import {Drash} from "../../mod.ts";

export async function runServer (server: Drash.Http.Server, configs: {
  hostname: string,
  port: number
} = {
  hostname: "localhost",
  port: 3000
}) {
  await server.run({
    hostname: configs.hostname,
    port: configs.port,
  });
}