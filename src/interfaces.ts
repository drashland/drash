import { Request, Resource, Response, Service, ExceptionLayer, Errors } from "../mod.ts";

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
  CONNECT?: (request: Request, response: Response) => Promise<void> | void;
  DELETE?: (request: Request, response: Response) => Promise<void> | void;
  GET?: (request: Request, response: Response) => Promise<void> | void;
  HEAD?: (request: Request, response: Response) => Promise<void> | void;
  OPTIONS?: (request: Request, response: Response) => Promise<void> | void;
  PATCH?: (request: Request, response: Response) => Promise<void> | void;
  POST?: (request: Request, response: Response) => Promise<void> | void;
  PUT?: (request: Request, response: Response) => Promise<void> | void;
  TRACE?: (request: Request, response: Response) => Promise<void> | void;
}

export interface IResourceServices {
  CONNECT?: Service[];
  DELETE?: Service[];
  GET?: Service[];
  HEAD?: Service[];
  OPTIONS?: Service[];
  PATCH?: Service[];
  POST?: Service[];
  PUT?: Service[];
  TRACE?: Service[];
  ALL?: Service[];
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
  resources: typeof Resource[];
  services?: Service[];
  exception?: typeof ExceptionLayer;
}

export interface IService {
  /**
   * Method that is ran before a resource is handled
   */
  runBeforeResource?: (
    request: Request,
    response: Response,
  ) => void | Promise<void>;

  /**
   * Method that is ran after a reosurce is handled
   */
  runAfterResource?: (
    request: Request,
    response: Response,
  ) => void | Promise<void>;
}

export interface IExceptionLayer {
  catch: (
    error: Errors.HttpError,
    request: Request,
    response: Response
  ) => void | Promise<void>;
}
