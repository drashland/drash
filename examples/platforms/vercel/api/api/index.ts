import {
  Application,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";

class Home extends Resource {
  paths = ["/api"];

  GET(request: Request) {
    return new Response("Oh so easy");
  }
}

const app = Application
  .builder()
  .resources(Home)
  .build();

export default {
  fetch(request: Request) {
    return app
      .handle<Response>(request)
      .catch(() => {
        return new Response("Sorry, but we hit an error!", {
          status: 500,
          statusText: "Internal Server Error",
        });
      });
  },
};
