// namespace Drash.Http

import { ServerRequest } from "https://deno.land/x/http/server.ts";

export default class Request extends ServerRequest {

  public original_request_object: ServerRequest;
  public path_params: any = {};
  public url_path: string;
  public url_query_params: any = {};

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param ServerRequest request
   */
  constructor(request: ServerRequest) {
    super();
    this.r = request.r;
    this.w = request.w;
    this.proto = request.proto;
    this.conn = request.conn;
    this.headers = request.headers;
    this.url = request.url;
    this.method = request.method;
    this.original_request_object = request;
  }
}

