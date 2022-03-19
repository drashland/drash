import * as Drash from "../../../../../mod.ts";
import { serviceGlobals } from "../open_api.ts";

const css = Deno.readFileSync(
  "../views/swagger_ui_standard/swagger-ui.css",
);
const bundle = Deno.readFileSync(
  "../views/swagger_ui_standard/swagger-ui-bundle.js",
);
const standalone = Deno.readFileSync(
  "../views/swagger_ui_standard/swagger-ui-standalone-preset.js",
);
const decoder = new TextDecoder();

export class SwaggerUIResource extends Drash.Resource {
  public paths = [
    serviceGlobals.path_to_swagger_ui,
    "/swagger-ui(.+|\.js|\.json|\.css|-bundle\.js|-standalone-preset\.js)?",
  ];

  public GET(request: Drash.Request, response: Drash.Response): void {
    if (
      request.url.includes("swagger-ui") &&
      request.url.includes(".json")
    ) {
      const url = new URL(request.url);
      const filename = url.pathname.replace("/", "").replace(".json", "");
      return response.send<string>(
        "application/json",
        serviceGlobals.specifications.get(filename) ?? "{}",
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
      "/var/src/drashland/deno-drash/src/services/open_api/v2/views/swagger_ui_standard/index.html",
    );

    let decodedHtml = decoder.decode(html);

    decodedHtml = decodedHtml.replace(
      /\{\{ var_urls \}\}/g,
      serviceGlobals.specification_urls,
    );

    return response.html(decodedHtml);
  }
}
