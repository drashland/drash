import * as Drash from "./local_esm_build/mod.js";

import * as http from "http";

const hostname = "127.0.0.1";
const port = 3000;

class HomeResource extends Drash.Resource {
  paths = ["/"];

  GET(request, response) {
    console.log(`test`, response);
    return response.body("Hello, Drash (NP)!");
  }
}

const requestHandler = Drash.createRequestHandler({
  resources: [
    HomeResource,
  ],
});

Promise.resolve()
  .then(async () => {
    return await requestHandler;
  })
  .then((r) => {
    const server = http.createServer(async (req, res) => {
      try {
        await r.handle(req, res);
        res.end();
      } catch (error) {
        // console.log(`WOOPS`, error);
      }
      // const res = await res.statusCode = 200;
      // res.setHeader("Content-Type", "text/plain");
      // res.end("Hello World");
    });

    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
  });
