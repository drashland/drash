import Drash from "../../mod.ts";
import { ServerRequest } from "../../deno_std.ts";
const decoder = new TextDecoder();

/**
 * @memberof Drash.Http
 * @class Request
 *
 * @description
 *     This is a wrapper class for `ServerRequest` (from
 *     https://deno.land/x/http/server.ts). It just adds more properties to the
 *     request object--allowing Drash to work with a more flexible request
 *     object.
 *
 *     This class extends `ServerRequest`.
 */
export default class Request extends ServerRequest {
  /**
   * @description
   *     A property to access the request's body in key-value pair format.
   *
   * @property any body_parsed
   */
  public body_parsed: any = {};

  /**
   * @description
   *     A property to access the request's body as raw string without any
   *     further parsing.
   *
   * @property any body_raw_string
   */
  public body_raw_string: string;

  /**
   * @description
   *     A property to access the original `ServerRequest` object.
   *
   * @property ServerRequest original_request_object
   */
  public original_request_object: ServerRequest;

  /**
   * @description
   *     A property to hold the path params of the request. For example, if a
   *     request with the URI `/users/1234` is sent by a client and the request
   *     is matched to a resource class with a path of `/users/:id`, then
   *     `this.path_params.id == 1234`.
   *
   * @property any path_params
   */
  public path_params: any = {};

  /**
   * @description
   *     A property to hold the path of the request's URL. For example, if a
   *     request with the URL `localhost:8000/users/1234` is sent by a client,
   *     then the path to this request is `/users/1234`.
   *
   * @property string url_path
   */
  public url_path: string;

  /**
   * @description
   *     A property to hold the query params of the request's URL in key-value
   *     pair format. For example, if a request with the URL
   *     `localhost:8000?response_content_type=text/html` is sent by a client,
   *     then `this.url_query_params == {response_content_type: "text/html"}`.
   *
   * @property any url_query_params
   */
  public url_query_params: any = {};

  /**
   * @description
   *     A property to hold the query string of the request's URL. For example,
   *     if a request with the URL
   *     `localhost:8000?response_content_type=text/html` is sent by a client,
   *     then `this.url_query_string == "response_content_type=text/html"`. Note
   *     that the leading `?` is removed.
   *
   * @property string url_query_string
   */
  public url_query_string: string = null;
}
