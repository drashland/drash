import * as Drash from "../../../mod.ts";
const css = Deno.readFileSync(
  "/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui.css",
);
const bundle = Deno.readFileSync(
  "/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui-bundle.js",
);
const standalone = Deno.readFileSync(
  "/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui-standalone-preset.js",
);
const decoder = new TextDecoder();
import { pathToSwaggerUI, specs } from "./open_api.ts";

export class SwaggerUIResource extends Drash.Resource {
  public paths = [
    pathToSwaggerUI,
    "/swagger-ui(.+|\.js|\.json|\.css|-bundle\.js|-standalone-preset\.js)?",
  ];

  public GET(request: Drash.Request, response: Drash.Response) {
    console.log(request.url);
    if (
      request.url.includes("swagger-ui") &&
      request.url.includes(".json")
    ) {
      const url = new URL(request.url);
      const filename = url.pathname.replace("/", "").replace(".json", "");
      console.log(filename);
      console.log(specs.get(filename));
      return response.send<string>(
        "application/json",
        specs.get(filename) ?? "{}",
      );
    }
    if (request.url.includes(".css")) {
      return response.send<string>("text/css", decoder.decode(css));
    }
    if (request.url.includes("bundle.js")) {
      return response.send<string>(
        "application/javascript",
        decoder.decode(bundle),
      );
    }
    if (request.url.includes("standalone-preset.js")) {
      return response.send<string>(
        "application/javascript",
        decoder.decode(standalone),
      );
    }

    const html = Deno.readFileSync(
      "/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/index.html",
    );

    return response.html(decoder.decode(html));
  }
}
