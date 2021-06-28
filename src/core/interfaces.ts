import type { MultipartFormData } from "../../deps.ts";

import { Request } from "./http/request.ts";
import { Response } from "./http/response.ts";
import { Resource } from "./http/resource.ts";
import { Service } from "./http/service.ts";

interface IKeyValuePairs {
  [key: string]: unknown;
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
export interface IParsedRequestBody {
  content_type: string;
  data: undefined | MultipartFormData | IKeyValuePairs;
}

/**
 * This is used to type a Resource object.
 */
export interface IResource {
  services?: { after_request?: []; before_request?: [] };
  name?: string;
  paths?: string[];
  paths_parsed?: IResourcePaths[];
}

/**
 * This is used to type a Resource object's paths. During the
 * request-resource lifecycle, the Server object parses the paths in a reosurce
 * and ends up with the following interface.
 */
export interface IResourcePaths {
  og_path: string;
  regex_path: string;
  params: string[];
}

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
 * memory_allocation?: {
 *   multipart_form_data?: number
 * }
 *     The amount of memory to allocate to certain parts of the codebase.
 *     For example, the multipart reader uses a default of 10MB, but you can
 *     override that default by specifying the following:
 *
 *         memory_allocation: {
 *           multipart_form_data: 128 // This would be translated to 128MB
 *         }
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
export interface IServerConfigs {
  memory_allocation?: { multipart_form_data?: number };
  services?: IServerConfigsServices;
  resources?: typeof Resource[];
  response_output?: string;
}

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
 *       middleware: {
 *         before_request: [beforeRequestService],
 *         afterRequest: [afterRequestService]
 *       }
 *     }
 */
export interface IServerConfigsServices {
  // Services executed before a request is made (before a resource is found).
  before_request?: typeof Service[];

  // Services executed after requests, but before responses are sent
  after_request?: typeof Service[];
}

export interface IService {
  // The method to run during compile time
  setUp?: () => Promise<void> | void;

  // The method to run during runtime
  run?: (request: Request, response?: Response) => Promise<void> | void;
}
