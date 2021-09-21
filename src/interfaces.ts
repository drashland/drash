import { Resource } from "../mod.ts"

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
  services?: IResourceServices
  // Methods
  CONNECT?: (context: Context) => Promise<void> | void;
  DELETE?: (context: Context) => Promise<void> | void;
  GET?: (context: Context) => Promise<void> | void;
  HEAD?: (context: Context) => Promise<void> | void;
  OPTIONS?: (context: Context) => Promise<void> | void;
  PATCH?: (context: Context) => Promise<void> | void;
  POST?: (context: Context) => Promise<void> | void;
  PUT?: (context: Context) =>Promise<void> | void ;
  TRACE?: (context: Context) => Promise<void> | void;
}

export interface IResourceServices {
  
    CONNECT?: Drash.Service[],
    DELETE?: Drash.Service[],
    GET?: Drash.Service[],
    HEAD?: Drash.Service[],
    OPTIONS?: Drash.Service[],
    PATCH?: Drash.Service[],
    POST?: Drash.Service[],
    PUT?: Drash.Service[],
    TRACE?: Drash.Service[],
    ALL?: Drash.Service[],
  
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
  default_response_type?: string;
  hostname: string;
  key_file?: string;
  port: number;
  protocol: "http" | "https";
  resources: typeof Resource[];
  services?: Drash.Service[];
}

export interface IService {
  // The method to run during compile time
  setUp?: () => Promise<void> | void;

  /**
   * Method that is ran before a resource is handled
   */
  runBeforeResource?: (context: Context) => void|Promise<void>

  /**
   * Method that is ran after a reosurce is handled
   */
  runAfterResource?: (context: Context) => void|Promise<void>
}

export interface Context {
  request: Drash.DrashRequest,
  response: Drash.DrashResponse
}
