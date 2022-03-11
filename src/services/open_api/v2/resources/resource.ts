import * as Drash from "../../../../../mod.ts";
import { TResourceOperationSpec } from "../types.ts";

export class Resource extends Drash.Resource {
  /**
   * The Swagger spec this resource should placed in during the documentation process. If left `undefined`, then it will be placed in the Swagger spec specified during instantion of `OpenAPI.Service`.
   */
  public spec?: string;

  /**
   * Operation Object specification.
   */
  public operations: {
    [method: string]: TResourceOperationSpec;
  } = {};

  /**
   * Create a DELETE method with specifications.
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationDelete(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.delete = spec;
    return handler;
  }

  /**
   * Create a GET method with specifications.
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationGet(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.get = spec;
    return handler;
  }

  /**
   * Create a HEAD method with specifications.
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationHead(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.head = spec;
    return handler;
  }

  /**
   * Create an OPTIONS method with specifications.
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationOptions(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.options = spec;
    return handler;
  }

  /**
   * Create a PATCH method with specifications.
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationPatch(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.patch = spec;
    return handler;
  }

  /**
   * Create a POST method with specifications.
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationPost(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.post = spec;
    return handler;
  }

  /**
   * Create a PUT method with specifications.
   * @param spec The Operation Object spec for this method.
   * @param handler The handler that handles requests to this method.
   * @returns The handler.
   */
  public operationPut(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.put = spec;
    return handler;
  }
}
