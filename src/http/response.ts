import {
  Cookie,
  deleteCookie,
  encoder,
  setCookie,
  Status,
  STATUS_TEXT,
} from "../../deps.ts";
import {
  ICreateable,
  IResponse,
  IResponseOptions,
  IResponseOutput,
} from "../interfaces.ts";
import { Request } from "./request.ts";

export interface IOptions {
  default_content_type?: string;
}

/**
 * Response handles sending a response to the client making the request.
 */
export class Response implements IResponse {
  public status = 200;

  public body: unknown = undefined;

  public headers = new Headers();

  protected options: IResponseOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public create(): void {
    this.headers.set(
      "Content-Type",
      this.options.default_response_content_type!,
    );
  }

  public addOptions(options: IResponseOptions): void {
    this.options = options;
  }
}
