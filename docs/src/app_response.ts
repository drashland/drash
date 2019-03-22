import Drash from "../bootstrap.ts";
import * as ResponseService from "./response_service.ts";

class AppResponse extends Drash.Http.Response {
  /**
   * Send a response to the client.
   */
  public async send(): Promise<any> {
    const conf = Drash.getEnvVar("DRASH_CONF").toArray().value;
    let body;

    switch (this.headers.get("Content-Type")) {
      // Handle HTML
      case "text/html":
        let indexEjsFile = `${conf.paths.docs_root}/src/templates/index.ejs`;
        Drash.Vendor.ConsoleLogger.debug("Rendering HTML response.");
        try {
          body = await ResponseService.getAppDataInHtml(indexEjsFile);
        } catch (error) {
          Drash.Vendor.ConsoleLogger.debug("WTF... tried rendering an HTML response, but I don't even know.");
          Drash.Vendor.ConsoleLogger.debug(`Attempted rendering file: ${indexEjsFile}`);
          Drash.Vendor.ConsoleLogger.debug("Error below:");
          console.log(error);
          body = "<img src='/public/assets/img/meme-congrats-you-fucked-up.jpg'>";
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
