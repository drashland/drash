// namespace Drash.Http

import { ServerRequest } from "https://deno.land/x/http/server.ts";

/**
 * @class Request
 * This is a wrapper class for `ServerRequest`. It just adds more properties to
 * the request object--allowing Drash to work with a more flexible request
 * object.
 */
export default class Request extends ServerRequest {

  /**
   * A property to access the original `ServerRequest` object.
   *
   * @property ServerRequest original_request_object
   */
  public original_request_object: ServerRequest;

  /**
   * A property to hold the path params of the request. For example, if a
   * request with the URI `/users/1234` is sent by a client and the request is
   * matched to a resource class with a path of `/users/:id`, then
   * `this.path_params.id == 1234`.
   *
   * @property any path_params
   */
  public path_params: any = {};

  /**
   * A property to hold the path of the request's URL. For example, if a request
   * with the URL `localhost:8000/users/1234` is sent by a client, then the path
   * to this request is `/users/1234`.
   *
   * @property string url_path
   */
  public url_path: string;

  /**
   * A property to hold the query params of the request's URL in key-value pair
   * format. For example, if a request with the URL
   * `localhost:8000?response_content_type=text/html` is sent by a client, then
   * `this.url_query_params == {response_content_type: "text/html"}`.
   *
   * @property any url_query_params
   */
  public url_query_params: any = {};

  /**
   * A property to hold the query string of the request's URL. For example, if a
   * request with the URL `localhost:8000?response_content_type=text/html` is
   * sent by a client, then `this.url_query_string ==
   * "response_content_type=text/html"`. Note that the leading
   * `?` is removed.
   *
   * @property string url_query_string
   */
  public url_query_string: string = null;

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

