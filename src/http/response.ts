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
  #options: Drash.Interfaces.IResponseOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * See Drash.Interfaces.ICreateable.create().
   */
  public create(options: Drash.Interfaces.IResponseOptions): void {
    // TODO(crookse) this.#setOptions(options);
    this.headers.set(
      "Content-Type",
      options.default_response_content_type!,
    );

    this.#options = options;
  }

  /**
   * Parse the response body to ensure it is sent correctly to the request
   * object's `respond()` method.
   *
   * @returns The parsed response in a proper format for the request object's
   * `respond()` method.
   */
  public parseBody(): Drash.Types.TResponseBody {
    if (!this.body) {
      return;
    }

    // Body is a string? Return it as a string.
    if ((this.body as string).constructor.name == "String") {
      return this.body as string;
    }

    // Body is encoded via new `TextEncoder().encode()`? Return it as a
    // Uint8Array.
    if ((this.body as Uint8Array).constructor.name == "Uint8Array") {
      return this.body as Uint8Array;
    }

    // Body is a reader? Return it as a Reader.
    if (typeof (this.body as Deno.Reader).read == "function") {
      // TODO(crookse) Make sure this actually works. For example, put this
      // method in a resource and request the resource:
      //
      //     GET() {
      //       this.response.body = this.request.body;
      //       return this.response;
      //     }
      //
      // The above should return whatever is in the request's body.
      return this.body as Deno.Reader;
    }

    // Automatically stringify JSON-parsable objects.
    if (
      this.headers.get("Content-Type") == "application/json" &&
      typeof this.body == "object"
    ) {
      try {
        return JSON.stringify(this.body);
      } catch (_error) {
      }
    }

    // If the code reaches this, then the body that was set was not one of the
    // following:
    //
    //     - a string
    //     - a Uint8Array
    //     - a Deno.Reader
    //     - an object that can be used with JSON.parse()
    throw new Drash.Errors.HttpError(
      500,
      "The requested resource could not generate a properly formatted response."
    );
  }
}
