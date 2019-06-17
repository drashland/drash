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

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param ServerRequest request
   */
  constructor(request: ServerRequest) {
    super();
    this.r = request.r;
    this.w = request.w;
    this.proto = request.proto;
    this.headers = request.headers;
    this.url = request.url;
    this.method = request.method;
    this.original_request_object = request;
  }

  // FILE MARKER: METHOD - PUBLIC //////////////////////////////////////////////

  /**
   * TODO(crookse) figure out the MIME type of the request body and parse it:
   *     [x] if application/json, then JSON.parse()
   *     [x] if application/x-www-form-urlencoded, then do what?
   *     [ ] if something else, then do what?
   *
   * @description
   *     Parse the body of the request so that it can be used as an associative
   *     array.
   *
   *     If the request body's content type is `application/json`, then
   *     `{"username":"root","password":"alpine"}` becomes `{ username: "root", password: "alpine" }`.
   *
   *     If the request body's content type is
   *     `application/x-www-form-urlencoded`, then
   *     `username=root&password=alpine` becomes `{ username: "root", password: "alpine" }`.
   *
   *     If the body can't be parsed, then this method will set
   *     `this.body_parsed` to `false` to denote that the request body was not
   *     parsed.
   *
   * @return any
   *     This method resolves `this.body_parsed`, but only for testing purposes.
   *     This method can be called without assigning its resolved data to a
   *     variable. For example, you can call `await request.parseBody();` and
   *     access `request.body_parsed` immediately after. Before this method
   *     resolves `this.body_parsed`, it assigns the parsed request body to
   *     `this.body_parsed`.
   */
  public parseBody(): any {
    return new Promise(resolve => {
      this.body().then(raw => {
        let parsed: any;
        let rawString = decoder.decode(raw);
        this.body_raw_string = rawString;

        // Decide how to parse the string below. All HTTP requests will default
        // to application/x-www-form-urlencoded IF the Content-Type header is
        // not set in the request.
        //
        // ... there's going to be potential fuck ups here btw ...

        Drash.core_logger.debug(
          `HTTP request Content-Type: ${this.headers.get("Content-Type")}`
        );

        // Is this an application/json body?
        if (this.headers.get("Content-Type") == "application/json") {
          try {
            parsed = JSON.parse(rawString);
          } catch (error) {
            parsed = false;
          }
          this.body_parsed = parsed;
          resolve(this.body_parsed);
          return;
        }

        // Does this look like an application/json body?
        if (!parsed) {
          try {
            parsed = JSON.parse(rawString);
          } catch (error) {
            parsed = false;
          }
        }

        // All HTTP requests default to application/x-www-form-urlencoded, so
        // try to parse the body as a URL query params string if the above logic
        // didn't work.
        if (!parsed) {
          try {
            if (rawString.indexOf("?") !== -1) {
              rawString = rawString.split("?")[1];
            }
            parsed = Drash.Services.HttpService.parseQueryParamsString(
              rawString
            );
          } catch (error) {
            parsed = false;
          }
        }

        this.body_parsed = parsed;
        resolve(this.body_parsed);
      });
    });
  }
}
