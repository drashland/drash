import {
  Errors,
  Request as DrashRequest,
  Resource,
  Response,
  Server,
  Types,
} from "../mod.ts";
import type { ConnInfo } from "../deps.ts";

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
// - IServer
// - IServerOptions
// - IService

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
 *    where the mime type is defined. If not set, it's probably a custom media type.
 *      - apache - Apache common media types
 *      - iana - IANA-defined media types
 *      - nginx - nginx media types
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
 * path_parameters
 *     A key-value string defining the path parameters that were passed in by
 *     the request. This value is set in resource_handler.ts#getResource().
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
  paths: string[];
  services?: IResourceServices;
  // Methods
  CONNECT?: (request: DrashRequest, response: Response) => Promise<void> | void;
  DELETE?: (request: DrashRequest, response: Response) => Promise<void> | void;
  GET?: (request: DrashRequest, response: Response) => Promise<void> | void;
  HEAD?: (request: DrashRequest, response: Response) => Promise<void> | void;
  OPTIONS?: (request: DrashRequest, response: Response) => Promise<void> | void;
  PATCH?: (request: DrashRequest, response: Response) => Promise<void> | void;
  POST?: (request: DrashRequest, response: Response) => Promise<void> | void;
  PUT?: (request: DrashRequest, response: Response) => Promise<void> | void;
  TRACE?: (request: DrashRequest, response: Response) => Promise<void> | void;
}

export interface IResourceServices {
  CONNECT?: IService[];
  DELETE?: IService[];
  GET?: IService[];
  HEAD?: IService[];
  OPTIONS?: IService[];
  PATCH?: IService[];
  POST?: IService[];
  PUT?: IService[];
  TRACE?: IService[];
  ALL?: IService[];
}

/**
 * Options to help create the server object.
 */
export interface IServerOptions {
  // deno-lint-ignore camelcase
  cert_file?: string;
  hostname: string;
  // deno-lint-ignore camelcase
  key_file?: string;
  port: number;
  protocol: "http" | "https";
  resources?: typeof Resource[];
  services?: IService[];
  // deno-lint-ignore no-explicit-any camelcase
  error_handler?: new (...args: any[]) => IErrorHandler;
}

export interface IService {
  /**
   * Method that is ran before a resource is handled
   */
  runBeforeResource?: (
    request: DrashRequest,
    response: Response,
  ) => void | Promise<void>;

  /**
   * Method that is ran after a reosurce is handled
   */
  runAfterResource?: (
    request: DrashRequest,
    response: Response,
  ) => void | Promise<void>;

  /**
   * Method that runs during server build time.
   */
  runAtStartup?: (options: IServiceStartupOptions) => void | Promise<void>;
}

export interface IServiceStartupOptions {
  server: Server;
  resources: Types.ResourcesAndPatternsMap;
}

type Catch =
  | ((
    error: Errors.HttpError,
    request: Request,
    response: Response,
  ) => void | Promise<void>)
  | ((
    error: Errors.HttpError,
    request: Request,
    response: Response,
    connInfo: ConnInfo,
  ) => void | Promise<void>);

export interface IErrorHandler {
  /**
   * Method that gets executed during the request-resource-response lifecycle in
   * the event an error is thrown.
   */
  catch: Catch;
}

/**
 * This proxy is created when an incoming request's URL is matched to a
 * resource (see the implementation of `Drash.Server.handleRequest()`). Each
 * incoming request that is matched to a resource uses its own `IResourceProxy`
 * object for its own context.
 */
export interface IResourceProxy {
  /** The instantiated resource class' path params (if any). */
  pathParams: Map<string, string>;
  /** The instantiated resource class. */
  instance?: Resource;
}
