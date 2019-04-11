import Drash from "https://deno.land/x/drash/mod.ts";
import { renderFile } from "https://deno.land/x/dejs/dejs.ts";

class Response extends Drash.Http.Response {
  public async generateHtmlResponse(): Promise<any> {
    let rawOutput = await renderFile("/path/to/your/project/index.ejs", {body: this.body});
    this.body = rawOutput.toString();
    return this.body;
  }
}

Drash.Http.Response = Response;
