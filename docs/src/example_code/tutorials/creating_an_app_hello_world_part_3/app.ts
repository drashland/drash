import Drash from "https://deno.land/x/drash/mod.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource],
  logger: new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "all",
    tag_string: "{level} |"
  })
});

server.run();
