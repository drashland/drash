import * as Drash from "../../mod.ts";

export class DrashResponse {

  public body: BodyInit | null = null;
  public headers: Headers = new Headers();
  public status: number = 200;
  public status_text: string = "OK";

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(defaultResponseContentType: string) {
    this.headers.set("Content-Type", defaultResponseContentType);
  }
}
