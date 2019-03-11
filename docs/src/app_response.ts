import Drash from "../bootstrap.ts";
import * as ResponseService from "./response_service.ts";

class AppResponse extends Drash.Http.Response {
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
          const conf = Drash.getEnvVar("DRASH_CONF").toArray().value;
          body = await ResponseService.getAppDataInHtml(
            `${conf.paths.docs_root}/src/templates/index.ejs`
          );
        } catch (error) {
          Drash.Vendor.ConsoleLogger.debug("WTF.");
          Drash.Vendor.ConsoleLogger.debug("Error below:");
          console.log(error);
          body = "mmmmm.... you/something fkd up.";
        }
        break;
      // Handle JSON
      case "application/json":
        Drash.Vendor.ConsoleLogger.debug("Stringifying JSON response.");
        body = JSON.stringify({
          status_code: this.status_code,
          body: this.body
        });
        break;
    }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body)
    });
  }
}

Drash.Http.Response = AppResponse;
