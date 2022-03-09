import * as Drash from "../../../../../mod.ts";
import { TResourceOperationSpec } from "../types.ts";
import { IResource } from "../interfaces.ts";

export class Resource extends Drash.Resource implements IResource {

  public spec?: string;

  /**
   * Operation Object specification.
   */
  public operations: {
    [method: string]: TResourceOperationSpec
  } = {};


  public operationDelete(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.delete = spec;
    return handler;
  }

  public operationPost(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.post = spec;
    return handler;
  }

  public operationGet(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.get = spec;
    return handler;
  }

  public operationHead(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.head = spec;
    return handler;
  }

  public operationOptions(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.options = spec;
    return handler;
  }

  public operationPatch(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.patch = spec;
    return handler;
  }

  public operationPut(
    spec: TResourceOperationSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.operations.put = spec;
    return handler;
  }
}