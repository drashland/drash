import * as Drash from "../../../mod.ts";
const html = Deno.readFileSync("/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/index.html");
const css = Deno.readFileSync("/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui.css");
const bundle = Deno.readFileSync("/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui-bundle.js");
const standalone = Deno.readFileSync("/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui-standalone-preset.js");
const decoder = new TextDecoder();
import { pathToSwaggerUI, openApiSpec } from "./open_api.ts";

export class SwaggerUIResource extends Drash.Resource {
  public paths = [
    pathToSwaggerUI,
    "/swagger-ui(\.json|\.css|-bundle\.js|-standalone-preset\.js)?"
  ];

  public GET(request: Drash.Request, response: Drash.Response) {
    if (request.url.includes("swagger-ui.json")) {
      console.log(request.url);
      return response.send<string>("application/json", openApiSpec);
    }
    if (request.url.includes(".css")) {
      console.log(request.url);
      return response.send<string>("text/css", decoder.decode(css));
    }
    if (request.url.includes("bundle.js")) {
      console.log(request.url);
      return response.send<string>("application/javascript", decoder.decode(bundle));
    }
    if (request.url.includes("standalone-preset.js")) {
      console.log(request.url);
      return response.send<string>("application/javascript", decoder.decode(standalone));
    }

    return response.html(decoder.decode(html));
  }
}

