import * as Drash from "../../mod.ts";

export interface IOptions {
  default_content_type?: string;
}

/**
 * Response handles sending a response to the client making the request.
 */
export class Response implements Drash.Interfaces.IResponse {
  public status = 200;

  public body: Drash.Types.TResponseBody | unknown = undefined;

  public headers = new Headers();

  protected options: Drash.Interfaces.IResponseOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public create(options: Drash.Interfaces.IResponseOptions): void {
    this.headers.set(
      "Content-Type",
      options.default_response_content_type!,
    );

    this.options = options;
  }

  public parseBody(): Drash.Types.TResponseBody {
    if (!this.body) {
      return;
    }

    // Body is a string? Return it as a string.
    if (typeof this.body == "string") {
      return this.body as string;
    }

    // Body is encoded via new `TextEncoder().encode()`? Return it as a
    // Uint8Array.
    if (this.body instanceof Uint8Array) {
      return this.body as Uint8Array;
    }

    // Body is a reader? Return it as a Reader.
    if (typeof (this.body as Deno.Reader).read == "function") {
      return this.body as Deno.Reader;
    }

    if (
      this.headers.get("Content-Type") == "application/json"
    && typeof this.body == "object"
    ) {
      return JSON.stringify(this.body);
    }

    throw new Drash.Errors.HttpError(
      500,
      "The server could not generate a properly formatted response.",
    );
  }
}
