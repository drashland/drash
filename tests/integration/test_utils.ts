import {Drash} from "../../mod.ts";

export async function runServer (server: Drash.Http.Server, configs: {
  hostname?: string,
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

export async function runServerTLS (server: Drash.Http.Server, configs: {
  hostname?: string,
  port: number,
  certFile?: string,
  keyFile?: string
} = {
  hostname: "localhost",
  port: 3000,
}) {
  await server.runTLS({
     hostname: configs.hostname,
     port: configs.port,
     certFile: "./tests/integration/app_3002_https/server.crt",
     keyFile: "./tests/integration/app_3002_https/server.key",
   })
};