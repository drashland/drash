import { Drash } from "../../deps.ts";
import * as Types from "./types.ts";

type HttpMethodHandler = (
  request: Drash.Request,
  response: Drash.Response
) => Promise<void> | void;

export class Builder {
  public spec: any = {
    swagger: "2.0",
    schemes: ["http"],
    paths: {},
  };

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - HTTP METHODS ////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public post(
    documentation: any,
    httpMethodHandler: HttpMethodHandler
  ): HttpMethodHandler {
    return async function (
      request: Drash.Request,
      response: Drash.Response,
    ) {
      return await httpMethodHandler(request, response);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public swagger(info: Types.InfoObject): void {
    this.spec.info = info;
  }

  public info(title: string, version: string): Types.InfoObject {
    return {
      title,
      version,
    };
  }

  public response(
    description: string,
    responseObject: Types.ResponseObject = {
      description: "",
    },
  ): Types.ResponseObject {
    return {
      ...responseObject,
      description,
    };
  }

  public parameter(
    location: Types.ParameterInTypes,
    name: string,
    parameterObjectFields: {[field: string]: unknown} = {}
  ): Types.ParameterObject {
    return {
      ...parameterObjectFields,
      in: location,
      name,
    };
  }

  public basePath(basePath: string): void {
    this.spec.basePath = basePath;
  }

  public schemes(schemes: Types.SchemeTypes[]): void {
    this.spec.schemes = schemes;
  }

  public host(host: string): void {
    this.spec.host = host
      .replace(/^(http|https)\:\/\//g, "")
      .replace("0.0.0.0", "localhost");
  }

  public build(): string {
    return JSON.stringify(this.spec, null, 2);
  }

  public pathsObject(
    path: string
  ): void {
    this.spec.paths[path] = {};
  }

  public pathItemObject(
    path: string,
    method: string,
    responses: Types.ResponsesObject,
    parameters?: Types.ParameterObject[],
  ): void {
    this.spec.paths[path][method.toLowerCase()] = {
      parameters: parameters ?? [],
      responses,
    };
  }
}
