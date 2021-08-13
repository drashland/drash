// This file contains ALL interfaces used by Drash. As a result, it is a very
// large file.
//
// To make it easier to search this file, it is recommended you search for
// "interface" to "jump" to each interface quickly.
//
// This interfaces in this file are sorted in alphabetical order.
//
// Interfaces:
// - IKeyValuePairs
// - IMime
// - IRequest
// - IRequestOptions
// - IRequestUrl
// - IResource
// - IResourceOptions
// - IResourcePathsParsed
// - IServer
// - IServerOptions
// - IService

import * as Drash from "../mod.ts";

/**
 * An interface to help type key-value pair objects with different values.
 *
 * Examples:
 *
 *     const myKvpObject: IKeyValuePairs<string> = {
 *       some_key: "some string",
 *     };
 *
 *     const myKvpObject: IKeyValuePairs<number> = {
 *       some_key: 1,
 *     };
 *
 *     interface SomeOtherInterface {
 *         [key: string]: number;
 *     }
 *     const myKvpObject: IKeyValuePairs<SomeOtherInterface> = {
 *       some_key: {
 *         some_other_key: 1
 *       },
 *     };
 */
export interface IKeyValuePairs<T> {
  [key: string]: T;
}

/**
 * This is used to type a MIME type object. Below are more details on the
 * members in this interface.
 *
 * [key: string]
 *     The MIME type (e.g., application/json).
 *
 * [key: string].charset?: string;
 *     The character encoding of the MIME type.
 *
 * [key: string].compressible?: boolean;
 *     Is this MIME type compressible?
 *
 * [key: string].extensions?: string[]
 *     An array of extensions that match this MIME type.
 *
 * [key: string].source?: string;
 *    TODO(crookse TODO-INTERFACES) Need to figure out what the source is and
 *    how it applies to MIME types.
 */
export interface IMime {
  [key: string]: {
    charset?: string;
    compressible?: boolean;
    extensions?: string[];
    source?: string;
  };
}

/**
 * Options to help create the request object.
 *
 * memory.multipart_form_data
 *     How much memory to allocate (in megabytes) to multipart/form-data body
 *     parsing.
 *
 * original
 *     The original request object. This is the object that the Drash.Request
 *     object wraps itself around. Users are able to interact with the original
 *     request object using the Drash.Request getters.
 *
 * server
 *     The Drash.Server object.
 */
export interface IRequestOptions {
  memory?: {
    multipart_form_data?: number;
  };
  original?: Drash.Deps.ServerRequest;
  server?: Drash.Server;
}

/**
 * An interface for the Drash.Request object's URL getter. This interfaces
 * follows the following schema:
 *
 *     https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_URL
 */
export interface IRequestUrl {
  anchor?: string;
  authority: string;
  domain: string;
  parameters?: string;
  path: string;
  port: number;
  scheme: "https" | "http";
}

/**
 * path_parameters
 *     A key-value string defining the path parameters that were passed in by
 *     the request. This value is set in resource_handler.ts#getResource().
 *
 * uri_paths
 *     The URI paths that this resource is accessible at.
 *
 * uri_paths_parsed
 *     See IResourcePathsParsed.
 *
 * services
 *     The services that will be run before or after one of this resource's HTTP
 *     methods.
 *
 * CONNECT()
 * DELETE()
 * GET()
 * HEAD()
 * OPTIONS()
 * PATCH()
 * POST()
 * PUT()
 * TRACE()
 *     If a request performs one of the above HTTP methods and the request is
 *     matched to this resource, then this method will be executed.
 */
export interface IResource {
  // Properties
  path_parameters: string;
  uri_paths: string[];
  uri_paths_parsed: IResourcePathsParsed[];
  services?: { after_request?: []; before_request?: [] };
  // Methods
  CONNECT?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
  DELETE?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
  GET?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
  HEAD?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
  OPTIONS?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
  PATCH?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
  POST?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
  PUT?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
  TRACE?: () => Promise<Drash.DrashResponse> | Drash.DrashResponse;
}

/**
 * Options to help create the resource object.
 *
 * path_parameters
 *     A key-value pair string defining the path parameters that were passed in
 *     by the request and associated to path parameters on the resource. For
 *     example, if the resource has `/:id` as a URI path and a request has a URI
 *     path of `/1`, then the following string would be set in this property:
 *
 *         "id=1"
 *
 *     Ultimately, this string is used when one of the following calls is made
 *     in a resource:
 *
 *         `this.request.params.path.get("some_param")`
 *         `this.request.pathParams.get("some_param")`
 *
 * request
 *     The Drash.Request object. This allows resource objects to access the
 *     request via `this.request`.
 *
 * server
 *     The Drash.Server object. This allows resource objects to access the
 *     server via `this.server`.
 */
export interface IResourceOptions {
  path_parameters?: string[];
  request?: Request;
  server?: Drash.Server;
}

/**
 * This is used to type a resource object's paths. During the request-resource
 * lifecycle, the server object parses the paths on a reosurce and ends up with
 * the following:
 *
 *     {
 *       og_path: "/:id",
 *       regex_path: "^([^/]+)/?$",
 *       params: ["id"],
 *     }
 *
 * og_path
 *     The original path.
 *
 * regex_path
 *     The original path transformed into a regular expression. This is used to
 *     help match request URI paths to a resource's URI path.
 *
 * params
 *     The original path can contain path parameters. For example, an original
 *     path can be defined as /:id. This means the `:id` portion is a path
 *     parameter. This path parameter would be stored in this `params` array.
 */
export interface IResourcePathsParsed {
  og_path: string;
  regex_path: string;
  params: string[];
}

/**
 * Options to help create the server object.
 */
export interface IServerOptions {
  cert_file?: string;
  default_response_content_type?: string;
  hostname?: string;
  key_file?: string;
  memory?: {
    multipart_form_data: number,
  };
  port?: number;
  protocol: "http" | "https";
  resources: typeof Drash.DrashResource[];
  services?: {
    // Services executed before a request is made (before a resource is found).
    before_request?: typeof Drash.Service[],

    // Services executed after requests, but before responses are sent
    after_request?: typeof Drash.Service[],
  };
}

export interface IService {
  // The method to run during compile time
  setUp?: () => Promise<void> | void;

  // The method to run during runtime
  // runAfterRequest?: (
  //   request: Drash.Request,
  //   response: Drash.Response,
  // ) => Promise<void> | void;

  // runBeforeRequest?: (request: Drash.Request) => Promise<void> | void;
}
