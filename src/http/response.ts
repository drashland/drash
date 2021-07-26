import * as Drash from "../../mod.ts";

export interface IOptions {
  default_content_type?: string;
}

/**
 * Response handles sending a response to the client making the request.
 */
export class Response implements Drash.Interfaces.IResponse {
  public status = 200;

  public body: Drash.Types.TResponseBody = undefined;

  public headers = new Headers();

  protected options: Drash.Interfaces.IResponseOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public create(): void {
    this.headers.set(
      "Content-Type",
      this.options.default_response_content_type!,
    );
  }

  public addOptions(options: Drash.Interfaces.IResponseOptions): void {
    this.options = options;
  }

  public async parseBody(): Promise<
    Uint8Array | string | Deno.Reader | undefined
  > {
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

    // Body is JSON? Return it as a JSON string.
    try {
      JSON.parse(JSON.stringify(this.body));
      return JSON.stringify(this.body);
    } catch (_error) {
      // Do nothing... We have no idea what the response format is.
    }

    throw new Drash.Errors.HttpError(
      500,
      "The server could not generate a properly formatted response.",
    );
  }
}
