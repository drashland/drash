import { IBuilder } from "./interfaces.ts";

/**
 * Data Types in Open API Specification v2.0.
 *
 * The unknown type can be any type to provide documentation. The explicit types
 *  are defined by Swagger Specification.
 */
export type DataType =
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

export type DataTypeSpec =
  & {
    type: string;
  }
  & Partial<{
    $ref: string;
    items: ItemsObjectSpec;
  }>;

export type ItemsObjectSpec =
  & {
    [key: string]: DataTypeSpec;
  }
  & Partial<{
    $ref: string;
  }>;

/**
 * HTTP methods allowed by Open API Specification v2.0 in the Path Item Object.
 */
export type PathItemObjectBuilderHttpMethods =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options";

export type OperationObject = {
  summary?: string;
  description?: string;
  externalDocs?: IBuilder;
  operationId?: string;
  consumes?: string[];
  produces?: string[];
  tags?: string[];
  parameters?: IBuilder[];
  responses?: ResponsesObject;
};

export type ResourceOperation = {
  parameters?: IBuilder[];
  responses?: ResponsesObject;
};

export type ParameterObject = IBuilder[];

export type ResponsesObjectSpec =
  & {
    [httpStatusCode: number]: ResponseObjectSpec | ReferenceObjectSpec;
  }
  & Partial<{
    default: ResponseObjectSpec | ReferenceObjectSpec;
  }>;

export type ResponseObjectSpec =
  & {
    description: string;
  }
  & Partial<{
    schema: SchemaObjectSpec;
    headers: HeadersObjectSpec;
    examples: ExampleObjectSpec;
  }>;

export type HeadersObjectSpec = {
  [name: string]: HeaderObjectSpec;
};

export type HeaderObjectSpec =
  & {
    type: "string" | "number" | "integer" | "boolean" | "array";
  }
  & Partial<{
    format: string;
    description: string;
    default: string;
    items: ItemsObjectSpec;
    collectionFormat: "csv" | "ssv" | "tsv" | "pipes";
    maximum: number;
    exclusiveMaximum: boolean;
    minimum: number;
    exclusiveMinimum: boolean;
    maxLength: number;
    minLength: number;
    pattern: string;
    maxItems: number;
    minItems: number;
    uniqueItems: boolean;
    enum: unknown[];
    multipleOf: number;
  }>;

export type ExampleObjectSpec = { [mimeType: string]: unknown };

export type ResponsesObject = { [statusCode: number]: string | IBuilder };
export type ReferenceObjectSpec = {
  $ref: string;
};
export type SchemaObjectSpec =
  & {
    type?: string;
    properties?: {
      [key: string]: DataType;
    };
  }
  & Partial<{
    $ref: string;
  }>;

export type ContactSpec = {
  name: string;
  url: string;
  email: string;
};

export type LicenseSpec = {
  name: string;
  url: string;
};

export type InfoObjectSpec = {
  title: string;
  description: string;
  termsOfService: string;
  contact: ContactSpec;
  license: LicenseSpec;
  version: string;
};

export type SwaggerObjectSpec = {
  swagger: string;
  info: InfoObjectSpec;
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
  tags: string[];
};
