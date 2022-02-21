import * as Drash from "../../../../../mod.ts";
import { getSpecURLS, pathToSwaggerUI, specs } from "../open_api.ts";

const css = Deno.readFileSync(
  "/var/src/drashland/deno-drash/src/services/open_api/spec_v2/views/swagger_ui_standard/swagger-ui.css",
);
const bundle = Deno.readFileSync(
  "/var/src/drashland/deno-drash/src/services/open_api/spec_v2/views/swagger_ui_standard/swagger-ui-bundle.js",
);
const standalone = Deno.readFileSync(
  "/var/src/drashland/deno-drash/src/services/open_api/spec_v2/views/swagger_ui_standard/swagger-ui-standalone-preset.js",
);
const decoder = new TextDecoder();

export class SwaggerUIResource extends Drash.Resource {
  public paths = [
    pathToSwaggerUI,
    "/swagger-ui(.+|\.js|\.json|\.css|-bundle\.js|-standalone-preset\.js)?",
  ];

  public GET(request: Drash.Request, response: Drash.Response) {
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
      "/var/src/drashland/deno-drash/src/services/open_api/spec_v2/views/swagger_ui_standard/index.html",
    );

    let decodedHtml = decoder.decode(html);

    decodedHtml = decodedHtml.replace(/\{\{ var_urls \}\}/g, getSpecURLS());

    return response.html(decodedHtml);
  }
}
