import * as Drash from "../../../../../mod.ts";
import { ResourceOperation } from "../types.ts";
import { formatSpecName } from "../open_api.ts";

export class Resource extends Drash.Resource {
  /**
   * This resource's Operation Object specification details. This is not the
   * specification itself. It is a property that holds builders to help create
   * the specification.
   */
  public operations: {
    [method: string]: ResourceOperation;
  } = {};

  /**
   * The Swagger spec this resource should placed in during the documentation
   * process. If left `undefined`, then it will be placed in the Swagger spec
   * specified during instantion of `OpenAPI.Service`.
   */
  public spec?: string;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create a DELETE method with specifications.
   *
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationDelete(
    spec: ResourceOperation,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.delete = spec;
    return handler;
  }

  /**
   * Create a GET method with specifications.
   *
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationGet(
    spec: ResourceOperation,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.get = spec;
    return handler;
  }

  /**
   * Create a HEAD method with specifications.
   *
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationHead(
    spec: ResourceOperation,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.head = spec;
    return handler;
  }

  /**
   * Create an OPTIONS method with specifications.
   *
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationOptions(
    spec: ResourceOperation,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.options = spec;
    return handler;
  }

  /**
   * Create a PATCH method with specifications.
   *
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationPatch(
    spec: ResourceOperation,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.patch = spec;
    return handler;
  }

  /**
   * Create a POST method with specifications.
   *
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationPost(
    spec: ResourceOperation,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.post = spec;
    return handler;
  }

  /**
   * Create a PUT method with specifications.
   *
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationPut(
    spec: ResourceOperation,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.put = spec;
    return handler;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Set this resource's spec. This method is used to place a resource in its
   * proper spec. If the resource does not use this method, then it will be
   * documented in the default spec that's defined in the `OpenAPIService`'s
   * constructor#options.
   *
   * @param title The spec's title. Example: "Drash"
   * @param version The spec's version. Example: "v2.0"
   * @returns Unified spec name format. Example: "DRASH V2.0"
   */
  protected setSpec(title: string, version: string): string {
    return formatSpecName(title, version);
  }
}
