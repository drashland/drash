import { Drash } from "../../deps.ts";

export type PathItemObject = {
  [key in Drash.Types.THttpMethod]?: OperationObject;
} & {
  $ref?: string;
  parameters?: (ParameterObject|ReferenceObject)[];
}

export type ParameterInTypes = "body" | "query" | "header" | "path" | "formData";

export type SchemeTypes = "http"|"https"|"ws"|"wss";

export type PrimitiveTypes = "string" | "number" | "integer" | "boolean" | "array" | "object";
export type ParameterTypes = "string" | "number" | "integer" | "boolean" | "array" | "file";

export type CollectionFormatTypes = "csv" | "ssv" | "tsv" | "pipes" | "multi";

export interface ResponsesObject {
  [code: string]: ResponseObject;
}

export interface TagObject {
  name: string;
  description?: string;
  external_docs?: ExternalDocumentationObject;
}

export interface ParameterObject {
  name: string;
  in: ParameterInTypes;
  description?: string;
  required?: boolean;
}

export interface ParmaterObjectInBody extends ParameterObject {
  schema: SchemaObject;
}

export interface ParameterObjectInHeader extends ParameterObject, JsonSchemaValidation {
  default?: unknown;
  format?: DataTypeFormats;
  in: "path";
  type: "string" | "number" | "integer" | "boolean"
}

export interface ParameterObjectInPath extends ParameterObject, JsonSchemaValidation {
  default?: unknown;
  format?: DataTypeFormats;
  in: "path";
  type: "string" | "number" | "integer" | "boolean"
}

export type ParameterObjectInFormData = ParameterObjectType & {
  allow_empty_value?: boolean;
  default?: unknown;
  format?: DataTypeFormats;
  in: "formData";
  type: ParameterTypes
} & JsonSchemaValidation;

export type ParameterObjectType = {
  name: string;
  in: ParameterInTypes;
  description?: string;
  required?: boolean;
}

export type ParameterObjectInQuery = ParameterObjectType & {
  in: "query";
  type: ParameterTypes;
  format?: DataTypeFormats;
  items?: ItemsObject;
  allow_empty_value?: boolean;
  collection_format?: CollectionFormatTypes;
} & JsonSchemaValidation;

// export type ParameterTypeArray =  {
//   items: ItemsObject;
//   collection_format?: CollectionFormatTypes;
// }

export interface IUserRequestBody {
  description?: string;
  schema: unknown;
}

export interface SwaggerObject {
  swagger: string;
  info: InfoObject;
  host?: string;
  basePath?: string;
  schemes?: SchemeTypes[];
  consumes?: string[];
  produces?: string[];
  paths: {[path: string]: PathsObject};
  definitions?: {[definition: string]: SchemaObject};
  parameters?: {[name: string]: ParameterObject};
  responses?: ResponsesObject;
  security_definitions?: {[name: string]: SecuritySchemeObject};
  security?: SecurityRequirementsObject[];
  tags?: TagObject[];
  external_docs?: ExternalDocumentationObject;
}

export interface SecuritySchemeObject {
  type: "basic" | "apiKey" | "oauth2";
  description?: string;
  name: string;
  in: "query" | "header";
  /** Required if `type` is "oauth2". */
  flow?: "implicit" | "password" | "application" | "accessCode";
  /**
   * Required if `type` is "oauth2" and flow is "implicit" or "accessCode". This
   * should be in the form of a URL.
   */
  authorization_url?: string;
  /**
   * Required if `type` is "oauth2" and flow is "password", "application", or
   * "accessCode". This should be in the form of a URL.
   */
  token_url?: string;
  /**
   * Required if `type` is "oauth2".
   */
  scopes?: ScopesObject;
}

export interface ScopesObject {
  [scope_name: string]: string;
}

export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}

export interface PathsObject {
  [path: string]: PathItemObject;
}

export interface OperationObject {
  tags?: string[];
  sumamry?: string;
  description?: string;
  external_docs?: ExternalDocumentationObject;
  operation_id?: string;
  consumes?: string[];
  produces?: string[];
  parameters?: (ParameterObject|ReferenceObject)[];
  responses?: ResponseObject;
  schemes: SchemeTypes[];
  security: SecurityRequirementsObject[];
}

export interface SecurityRequirementsObject {
  [key: string]: string;
}

export interface InfoObject {
  title: string;
  description?: string;
  terms_of_service?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
}

export interface ContactObject {
  name: string;
  url: string;
  email: string;
}

export interface ReferenceObject {
  $ref: string;
}

export type SchemaObject = {
  $ref?: string;
  items?: ItemsObject;
  type: PrimitiveTypes;
} & JsonSchema & JsonSchemaValidation & {};

export interface JsonSchema {
  items?: ItemsObject;
  all_of?: unknown[]; // TODO(crookse) What is this?
  properties?: {[property: string]: SchemaObject};
  additional_properties?: {[property: string]: SchemaObject};
}

export interface ResponseObject {
  description: string;
  schema?: SchemaObject;
  headers?: HeadersObject;
  examples?: ExampleObject;
}

export interface ExampleObject {
  [mime_type: string]: unknown
}

export interface HeadersObject {
  [header: string]: HeaderObject;
}

export interface HeaderObject {
  description?: string;
  type: PrimitiveTypes;
  format?: DataTypeFormats;
  /** Required if `type` is "array". */
  items?: ItemsObject;
}

type DataTypeFormats =
  "integer"
  | "long"
  | "float"
  | "double"
  | "string"
  | "byte"
  | "binary"
  | "boolean"
  | "date"
  | "date_time"
  | "password";

export type ItemsObject = {
  type: "string" | "number" | "integer" | "boolean" | "array";
  format?: DataTypeFormats;
  /** Required if `type` is "array". */
  items?: ItemsObject;
  /** Determines the format of the array if `type` is "array". */
  collection_format?: CollectionFormatTypes;
} & JsonSchemaValidation;

export interface JsonSchemaValidation {
  title?: string;
  maximum?: number;
  exclusive_maximum?: boolean;
  minimum?: number;
  exclusive_minimum?: boolean;
  max_length?: number;
  min_length?: number;
  pattern?: string;
  max_items?: number;
  min_items?: number;
  unique_items?: boolean;
  enum?: unknown[];
  multiple_of?: number;
}

