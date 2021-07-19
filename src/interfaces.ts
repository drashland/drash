// This file contains ALL interfaces used by Drash. As a result, it is a very
// large file.
//
// To make it easier to search this file, each interfaces is preceeded by a FILE
// MARKER comment. You can jump to each FILE MARKER comment to quickly jump to
// each interface.
//
// This interfaces are sorted in alphabetical order. For example, ICreateable
// comes before ICreateableOptions.

// TODO(crookse) Alphabetize this file.

import * as Drash from "../mod.ts";

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface ICreateable {
  /**
   * Build this object.
   */
  create: () => void;

  /**
   * Add the options to this object.
   *
   * @param options - This varies depending on the object being created. For
   * Example, ICreateableOptions is extended by IServerOptions. IServerOptions
   * contains the options that the Server class can specify when it is being
   * created.
   */
  addOptions: (options: ICreateableOptions) => void;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface ICreateableOptions {}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IRequestOptions extends ICreateableOptions {
  memory?: {
    multipart_form_data?: number;
  };
  original_request?: Drash.Deps.ServerRequest;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IResponseOptions extends ICreateableOptions {
  default_response_content_type?: string;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IServer extends ICreateable {}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IRequest extends ICreateable {
  path_params: IKeyValuePairs<string>;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IResponse extends ICreateable {
  headers: Headers;
  body: unknown;
  status: number;
  parseBody: () => Promise<Uint8Array | string | Deno.Reader | undefined>;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IKeyValuePairs<T> {
  [key: string]: T;
}

/**
 * This is used to type a MIME type object. Below are more details on the
 * members in this interface.
 *
 * [key: string]
 *     The mime type (e.g., application/json).
 *
 *     charset?: string;
 *         The character encoding of the MIME type.
 *
 *     compressible?: boolean;
 *         Is this MIME type compressible?
 *
 *     extensions?: string[]
 *         An array of extensions that match this MIME type.
 *
 *     source?: string;
 *         TODO(crookse) Need to figure out what the source is and how it
 *         applies to MIME types.
 */
export interface IMime {
  [key: string]: {
    charset?: string;
    compressible?: boolean;
    extensions?: string[];
    source?: string;
  };
}

// FILE MARKER /////////////////////////////////////////////////////////////////

/**
 * This is used to type a Request object's parsed body. Below are more details
 * on the members in this interface.
 *
 * content_type: string
 *
 *     The Content-Type of the request body. For example, if the body is
 *     JSON, then the Content-Type should be application/json.
 *
 * data: undefined|MultipartFormData|IKeyValuePairs
 *
 *     The data passed in the body of the request.
 */
export interface IRequestParsedBody {
  content_type: string | undefined;
  data: undefined | Drash.Deps.MultipartFormData | IKeyValuePairs<unknown>;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

/**
 * This is used to type a Resource object.
 */
export interface IResource extends ICreateable {
  // Properties
  path_params: string[];
  uri_paths: string[];
  uri_paths_parsed: IResourcePathsParsed[];
  services?: { after_request?: []; before_request?: [] };
  // Methods
  CONNECT?: () => Promise<IResponse> | IResponse;
  DELETE?: () => Promise<IResponse> | IResponse;
  GET?: () => Promise<IResponse> | IResponse;
  HEAD?: () => Promise<IResponse> | IResponse;
  OPTIONS?: () => Promise<IResponse> | IResponse;
  PATCH?: () => Promise<IResponse> | IResponse;
  POST?: () => Promise<IResponse> | IResponse;
  PUT?: () => Promise<IResponse> | IResponse;
  TRACE?: () => Promise<IResponse> | IResponse;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IResourceOptions extends ICreateableOptions {
  server?: Drash.Server;
  request?: Request;
  path_params?: string[];
}

// FILE MARKER /////////////////////////////////////////////////////////////////

/**
 * This is used to type a Resource object's paths. During the
 * request-resource lifecycle, the Server object parses the paths in a reosurce
 * and ends up with the following interface.
 */
export interface IResourcePathsParsed {
  og_path: string;
  regex_path: string;
  params: string[];
}

// FILE MARKER /////////////////////////////////////////////////////////////////

/**
 * This is used to type a Response object's output.
 */
export interface IResponseOutput {
  body: Uint8Array | string | Deno.Reader;
  headers: Headers;
  status: number;
  status_code?: number;
  send?: () => IResponseOutput | undefined;
}

/**
 * This is used to type a Server object's configs. Below are more details on the
 * members in this interface.
 *
 * services?: IService
 *
 *     The services that the server will execute during compile time and
 *     runtime.
 *
 *         services: {
 *           after_request: []
 *           before_request: []
 *           compile_time: []
 *         }
 *
 * resources?: Drash.Interfaces.Resource[]
 *
 *     An array of resources that the server should register. Passing in 0
 *     resources means clients can't access anything on the server--because
 *     there aren't any resources.
 *
 * response_output?: string
 *
 *     The fallback response Content-Type that the server should use. The
 *     response_output MUST be a proper MIME type. For example, the
 *     following would have the server default to JSON responses:
 *
 *         response_output: "application/json"
 */
export interface IServerOptions extends ICreateableOptions {
  cert_file?: string;
  default_response_content_type?: string;
  hostname?: string;
  key_file?: string;
  memory?: IServerOptionsMemory;
  port?: number;
  protocol?: "http" | "https";
  resources?: typeof Drash.Resource[];
  services?: IServerOptionsServices;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

/**
 * This is used to type a Service attached to the Server object. Below are more
 * details on the members in this interface.
 *
 * before_request
 *
 *     An array of functions that take a Request as a parameter.
 *     Method can be async.
 *
 * after_request
 *
 *     An array of functions that take in a Request as the first
 *     parameter, and a Response as the second parameter.
 *     Method can be async.
 *
 * For example:
 *
 *     function beforeRequestService (request: Request): void {
 *       ...
 *     }
 *
 *     async function afterRequestService (
 *       request: Request,
 *       response: Response
 *     ): Promise<void> {
 *       ...
 *     }
 *
 *     const server = new Server({
 *       services: {
 *         before_request: [beforeRequestService],
 *         afterRequest: [afterRequestService]
 *       }
 *     }
 */

/**
 * The amount of memory to allocate to the server's processes.  For example, the
 * multipart reader uses a default of 10MB, but you can override that default by
 * specifying:
 *
 *     multipart_form_data: 128 // This would be translated to 128MB
 */
export interface IServerOptionsMemory {
  multipart_form_data?: number;
}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IServerOptionsServices {
  // Services executed before a request is made (before a resource is found).
  before_request?: typeof Drash.Service[];

  // Services executed after requests, but before responses are sent
  after_request?: typeof Drash.Service[];
}

// FILE MARKER /////////////////////////////////////////////////////////////////

export interface IService {
  // The method to run during compile time
  setUp?: () => Promise<void> | void;

  // The method to run during runtime
  runAfterRequest?: (
    request: Drash.Request,
    response: Drash.Response,
  ) => Promise<void> | void;

  runBeforeRequest?: (request: Drash.Request) => Promise<void> | void;
}
