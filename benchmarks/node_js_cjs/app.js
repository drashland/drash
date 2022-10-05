const Drash = require("./local_cjs_build/mod");

const http = require("http");

const hostname = "127.0.0.1";
const port = 3000;

class HomeResource extends Drash.Resource {
  paths = ["/"];

  GET(request, response) {
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
        console.log(`WOOPS`, error);
      }
    });

    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
  });
