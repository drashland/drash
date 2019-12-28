import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
  response_output: "application/json",
  resources: [HomeResource]
});

server.run();


import { Client } from "https://deno.land/x/mysql/mod.ts";

const denoMysql = await new Client().connect({
  hostname: "127.0.0.1",
  username: "root",
  db: "deno_mysql",
  // password: "", // uncomment and add your password if using a password
});

export {
  denoMysql
}
