import * as Drash from "../mod.ts";

/**
 * This class is for throwing Drash-related errors.
 */
export class DrashError extends Error {
  /**
   * Construct an object of this class.
   *
   * @param code - See DRASH_ERROR_CODES array in this file.
   */
  constructor(code: string) {
    super(`[${code}] ${DRASH_ERROR_CODES[code]}`);
  }
}

/**
 * This class is for throwing errors in the request-resource-response lifecycle.
 */
export class HttpError extends Error {
  /**
   * A property to hold the HTTP response code associated with this
   * exception.
   */
  public code: number;

  /**
   * Construct an object of this class.
   *
   * @param code - See HttpError.code.
   * @param message - (optional) The exception message.
   */
  constructor(code: number, message?: string) {
    super(message);
    if (!message) {
      const statusText = Drash.Deps.STATUS_TEXT.get(code);
      if (statusText) {
        this.message = statusText;
      }
    }
    this.code = code;
  }
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - ERROR CODES ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// TODO(crookse TODO-ERRORS) Remove the "D" prefix. Just use numbers.
// TODO(crookse TODO-ERRORS) Document the error codes in the website.
export const DRASH_ERROR_CODES: { [k: string]: string } = {
  // This means the user's `paths` property contains something other than an
  // array of strings.
  "D1000": "Resource 'paths' property must be an array of strings.",
  // This means the user did not specify the `paths` property in a resource.
  "D1001": "Resource 'paths' property is missing.",
  // This means we forgot to pass in Deno's ServerRequest object when building
  // the request in `server.handleRequest()`.
  "D1002": "Request options require 'original' property.",
  // This means we forgot to pass in the `server` property when building the
  // request in `server.handleRequest()`.
  "D1003": "Request options require 'server' proeprty.",
  // This means there is an issue with the way we are parsing the Content-Type
  // header when trying to read request bodies as multipart/form-data. The issue
  // could be that the request object isn't properly handled or it was changed
  // on Deno's side.
  "D1004": "Error trying to find boundary in Content-Type header.",
  // This means we tried to read the multipart/form-data body using the
  // MultipartReader from Deno Std, but we were unable to. This is probably an
  // issue with the MultipartReader.
  "D1005": "Error reading request body as multipart/form-data.",
  // This means we forgot to pass in the `server` property when creating the
  // resource.
  "D1007": "Resource options require `server` property.",
  "D1009":
    "The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request",
};
