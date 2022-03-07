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

export type TResourceHttpMethodSpec = {
  parameters?: IBuilder[];
  responses?: {[statusCode: number]: IBuilder};
}