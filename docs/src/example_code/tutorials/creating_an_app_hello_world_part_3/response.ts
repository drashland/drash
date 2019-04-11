import Drash from "https://deno.land/x/drash/mod.ts";
import { renderFile } from "https://deno.land/x/dejs/dejs.ts";

class Response extends Drash.Http.Response {
  public async send(): Promise<any> {
    switch (this.headers.get("Content-Type")) {
      // Handle HTML
      case "text/html":
        let rawOutput = await renderFile("/path/to/your/project/index.ejs", {body: this.body});
        this.body = rawOutput.toString();
        break;
    }
    return super.send();
  }
}

Drash.Http.Response = Response;
