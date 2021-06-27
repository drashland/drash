import type { MultipartFormData } from "../deps.ts";

import { Request } from "./http/request.ts";
import { Response } from "./http/response.ts";
import { Resource } from "./http/resource.ts";

export interface IResponseOutput {
  body: Uint8Array | string | Deno.Reader;
  headers: Headers;
  status: number;
  status_code?: number;
  send?: () => IResponseOutput | undefined;
}

export interface IResourcePaths {
  og_path: string;
  regex_path: string;
  params: string[];
}

export interface IResource {
  middleware?: { after_request?: []; before_request?: [] };
  name: string;
  paths: string[];
  paths_parsed?: IResourcePaths[];
}

interface IKeyValuePairs {
  [key: string]: unknown;
}

/**
 * Contains the type of IParsedRequestBody
 * @remarks
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
 * Below are the configs explained in detail.
 *
 * logger?: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger
 *
 *     The server's logger. For example:
 *
 *         logger: new Drash.CoreLoggers.ConsoleLogger({
 *           enabled: true,
 *           level: "debug",
 *           tag_string: "{date} | {level} |",
 *           tag_string_fns: {
 *             date: function() {
 *               return new Date().toISOString().replace("T", " ");
 *             },
 *           },
 *         })
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
 * middleware?: IServerMiddleware
 *
 *     The middleware that the server will execute during compile time and
 *     runtime.
 *
 *         middleware: {
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
export interface ServerConfigs {
  memory_allocation?: { multipart_form_data?: number };
  middleware?: IServerMiddleware;
  resources?: IResource[];
  response_output?: string;
}

/**
 * The interface used for MIME Types
 * ```ts
 *     [key: string]
 *         The mime type.
 *
 *         charset?: string;
 *             The character encoding of the MIME type.
 *
 *         compressible?: boolean;
 *             Is this MIME type compressible?
 *
 *         extensions?: string[]
 *             An array of extensions that match this MIME type.
 *
 *         source?: string;
 *             TODO(crookse) Need to figure out what the source is and how it
 *             applies to MIME types.
 * ```
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
 * Contains the type of IServerMiddleware.
 *
 * @remarks
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
 * ```ts
 * function beforeRequestMiddleware (request: Request): void {
 *   ...
 * }
 * async function afterRequestMiddleware (
 *   request: Request,
 *   response: Response
 * ): Promise<void> {
 *   ...
 * }
 * const server = new Server({
 *   middleware: {
 *     before_request: [beforeRequestMiddleware],
 *     afterRequest: [afterRequestMiddleware]
 *   }
 * }
 * ```
 */
export interface IServerMiddleware {
  // Middleware to execute during compile time. The data that's compiled during
  // compile time will be able to be used during runtime.
  compile_time?: Array<
    {
      // The compile time method to run during compile time
      compile: () => Promise<void>;
      // The runtime method to run during runtime
      run: ((
        request: Request,
        response: Response,
      ) => Promise<void>);
    }
  >;

  // Middleware to execute during runtime based on compiled data from compile
  // time level middleware
  runtime?: Map<
    number,
    ((
      request: Request,
      response: Response,
    ) => Promise<void>)
  >;

  // Middleware executed before a request is made. That is, before a resource's
  // HTTP method is called.
  before_request?: Array<
    | ((request: Request) => Promise<void>)
    | ((request: Request) => void)
  >;

  // Middleware executed after requests, but before responses are sent
  after_request?: Array<
    | ((
      request: Request,
      response: Response,
    ) => Promise<void>)
    | ((request: Request, response: Response) => void)
  >;
  after_resource?: Array<
    | ((
      request: Request,
      response: Response,
    ) => Promise<void>)
    | ((request: Request, response: Response) => void)
  >;
}
