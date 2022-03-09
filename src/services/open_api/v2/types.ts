import { IBuilder } from "./interfaces.ts";

/**
 * Data Types in Open API Specification v2.0.
 *
 * The unknown type can be any type to provide documentation. The explicit types
 *  are defined by Swagger Specification.
 */
export type TDataType =
  | "integer"
  | "long"
  | "float"
  | "double"
  | "string"
  | "byte"
  | "binary"
  | "boolean"
  | "date"
  | "dateTime"
  | "password"
  | unknown;

/**
 * HTTP methods allowed by Open API Specification v2.0 in the Path Item Object.
 */
export type TPathItemObjectBuilderHttpMethods =
| "get"
| "post"
| "put"
| "delete"
| "patch"
| "head"
| "options"

export type TResourceOperationSpec = {
  summary?: string;
  description?: string;
  externalDocs?: IBuilder;
  operationId?: string;
  consumes?: string[];
  produces?: string[];
  tags?: string[];
  parameters?: IBuilder[];
  responses?: {[statusCode: number]: string | IBuilder};
}

export type TSwaggerObject = {
  swagger: string;
  info: {
    title: string;
    description: string;
    termsOfService: string;
    contact: {
      name: string;
      url: string;
      email: string;
    };
    license: {
      name: string;
      url: string;
    };
    version: string;
  };
  host: string;
  basePath: string;
  schemes: string[];
  consumes: string[];
  produces: string[];
  paths: {
    [path: string]: any;
  };
  definitions: {
    [definition: string]: any;
  };
  parameters: {
    [parameter: string]: any;
  };
  responses: {
    [response: string]: any;
  };
  security_definitions: {
    [security_definition: string]: any;
  };
  security: any[];
  tags: any[];
}