import Drash from "../../deno-drash/mod.ts";
const { cwd, stdout, copy } = Deno;
import { renderFile } from 'https://deno.land/x/dejs/dejs.ts';
import * as ResponseService from "./response_service.ts";

/**
 * Export the `Response` class that will be used in place of `Drash.Http.Response`
 */
export default class Response extends Drash.Http.Response {
  /**
   * Send a response to the client.
   */
  public async send(): Promise<any> {
    let body;

    switch (this.headers.get("Content-Type")) {
      // Handle HTML
      case "text/html":
        Drash.Vendor.ConsoleLogger.debug("Rendering HTML response.");
        try {
          const conf = Drash.getEnvVar("conf").toArray().value;
          body = await ResponseService.getAppDataInHtml(`${conf.paths.app_root}/src/templates/index.ejs`);
        } catch (error) {
          Drash.Vendor.ConsoleLogger.debug("WTF.");
          Drash.Vendor.ConsoleLogger.debug("Error below:");
          console.log(error);
          body = "Eric... you fkd up.";
        }
        break;
      // Handle JSON
      case "application/json":
        Drash.Vendor.ConsoleLogger.debug("Stringifying JSON response.");
        body = JSON.stringify({ status_code: this.status_code, body: this.body });
        break;
    }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body)
    });
  }
}
