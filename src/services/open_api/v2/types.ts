import { IBuilder } from "./interfaces.ts";
import { ParameterObjectBuilder } from "./builders/parameter_object_builder.ts";

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

export type TDataTypeSpec =
  & {
    type: string;
  }
  & Partial<{
    $ref: string;
    items: TItemsObjectSpec;
  }>;

export type TItemsObjectSpec =
  & {
    [key: string]: TDataTypeSpec;
  }
  & Partial<{
    $ref: string;
  }>;

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
  | "options";

export type TOperationObject = {
  summary?: string;
  description?: string;
  externalDocs?: IBuilder;
  operationId?: string;
  consumes?: string[];
  produces?: string[];
  tags?: string[];
  parameters?: IBuilder[];
  responses?: TResponsesObject;
};

export type TResourceOperation = {
  parameters?: IBuilder[];
  responses?: TResponsesObject;
};

export type TParameterObject = IBuilder[];

export type TResponsesObjectSpec =
  & {
    [httpStatusCode: number]: TResponseObjectSpec | TReferenceObjectSpec;
  }
  & Partial<{
    default: TResponseObjectSpec | TReferenceObjectSpec;
  }>;

export type TResponseObjectSpec =
  & {
    description: string;
  }
  & Partial<{
    schema: TSchemaObjectSpec;
    headers: THeadersObjectSpec;
    examples: TExampleObjectSpec;
  }>;

export type THeadersObjectSpec = {
  [name: string]: THeaderObjectSpec;
};

export type THeaderObjectSpec =
  & {
    type: "string" | "number" | "integer" | "boolean" | "array";
  }
  & Partial<{
    format: string;
    description: string;
    default: string;
    items: TItemsObjectSpec;
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

export type TExampleObjectSpec = {};

export type TResponsesObject = { [statusCode: number]: string | IBuilder };
export type TReferenceObjectSpec = {
  $ref: string;
};
export type TSchemaObjectSpec = {
  type?: string;
  properties?: {
    [key: string]: TDataType;
  };
};

export type TContactSpec = {
  name: string;
  url: string;
  email: string;
};

export type TLicenseSpec = {
  name: string;
  url: string;
};

export type TInfoObjectSpec = {
  title: string;
  description: string;
  termsOfService: string;
  contact: TContactSpec;
  license: TLicenseSpec;
  version: string;
};

export type TSwaggerObjectSpec = {
  swagger: string;
  info: TInfoObjectSpec;
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
