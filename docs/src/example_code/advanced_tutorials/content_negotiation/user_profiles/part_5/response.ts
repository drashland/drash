import Drash from "https://deno.land/x/drash/mod.ts";

export default class Response extends Drash.Http.Response {
  public generateResponse(): any {
    let contentType = this.headers.get("Content-Type")

    switch (contentType) {
      case "application/json":
        return JSON.stringify(this.body);
      case "application/xml":
      case "text/html":
      case "text/xml":
      case "text/plain":
        return this.body;
    }

    throw new Drash.Exceptions.HttpResponseException(400, `Response Content-Type "${contentType}" unknown.`);
  }
}

