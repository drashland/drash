import * as Drash from "../../../../mod.ts";
import { SpecBuilder } from "./builders/spec_builder.ts";

export type OpenAPIResource =
  & {
    spec: SpecBuilder;
    oas_operations: {
      [key in Drash.Types.THttpMethod]?: OperationObject & {
        responses?: ResponsesObject;
      };
    };
  }
  & Drash.Resource;

export type OpenAPISpecV2 = {
  swagger: string;
  info: InfoObject;
  host: string;
  base_path?: string;
  schemes?: SchemeTypes[];
  consumes?: string[];
  produces?: string[];
  security_definitions?: SecurityDefinitionsObject;
  security?: SecurityRequirementsObject[];
  tags?: TagObject[];
  external_docs?: ExternalDocumentationObject;
  paths: PathsObject;
  definitions?: DefinitionsObject;
  responses?: ResponsesObject;
};

export type DefinitionsObject = {
  [definitionName: string]: DefinitionObject;
};

export type DefinitionObject = SchemaObject;

export type PathItemObject =
  & {
    [key in Drash.Types.THttpMethod]?: OperationObject;
  }
  & {
    $ref?: string;
    parameters?: (ParameterObject | ReferenceObject)[];
  };

export type ParameterInTypes =
  | "body"
  | "query"
  | "header"
  | "path"
  | "formData";

export type SchemeTypes = "http" | "https" | "ws" | "wss";

export type PrimitiveTypes =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object";

export type ParameterTypes =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "file";

export type ItemsObjectTypes =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array";

export type CollectionFormatTypes = "csv" | "ssv" | "tsv" | "pipes" | "multi";

export interface ResponsesObject {
  [code: string | "default"]: ResponseObject;
}

export interface TagObject {
  name: string;
  description?: string;
  external_docs?: ExternalDocumentationObject;
}

// TODO(crookse) Make extended types
export type ParameterObject = {
  name: string;
  in: ParameterInTypes;
  type?: ParameterTypes;
  description?: string;
  required?: boolean;
  schema?: SchemaObject;
  format?: DataTypeFormats;
  allow_empty_value?: boolean;
  collection_format?: CollectionFormatTypes;
  default?: unknown;
  items?: ItemsObject;
} & JsonSchemaValidation;

export interface ParameterObjectInBody extends ParameterObject {
  schema: SchemaObject;
}

export type OperationObject = {
  /**
   * A short summary of what the operation does. For maximum readability in the swagger-ui, this field SHOULD be less than 120 characters.
   */
  summary?: string;
  /**
   * A verbose explanation of the operation behavior. GFM syntax can be used for rich text representation.
   */
  description?: string;
  /** Parameters used in this operation. */
  parameters?: ParameterObject[];
  /** Response returned by this operation. */
  responses: ResponsesObject;
  /** A proper MIME type. */
  consumes?: string[];
  /** Tags to group the operation into. */
  tags?: string[];
  external_docs?: ExternalDocumentationObject;
  sumamry?: string;
  operation_id?: string;
  produces?: string[];
  schemes?: SchemeTypes[];
  security?: SecurityRequirementsObject[];
};

export interface ParameterObjectInHeader
  extends ParameterObject, JsonSchemaValidation {
  default?: unknown;
  format?: DataTypeFormats;
  in: "path";
  type: "string" | "number" | "integer" | "boolean";
}

export interface ParameterObjectInPath
  extends ParameterObject, JsonSchemaValidation {
  default?: unknown;
  format?: DataTypeFormats;
  in: "path";
  type: "string" | "number" | "integer" | "boolean";
}

export type ParameterObjectInFormData = ParameterObjectType & {
  allow_empty_value?: boolean;
  default?: unknown;
  format?: DataTypeFormats;
  in: "formData";
  type: ParameterTypes;
} & JsonSchemaValidation;

export type ParameterObjectType = {
  name: string;
  in: ParameterInTypes;
  description?: string;
  required?: boolean;
};

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

export type SecurityDefinitionsObject = {
  [name: string]: SecuritySchemeObject;
};

export interface SwaggerObject {
  swagger: string;
  info: InfoObject;
  host?: string;
  basePath?: string;
  schemes?: SchemeTypes[];
  consumes?: string[];
  produces?: string[];
  paths: { [path: string]: PathsObject };
  definitions?: { [definition: string]: SchemaObject };
  parameters?: { [name: string]: ParameterObject };
  responses?: ResponsesObject;
  security_definitions?: SecurityDefinitionsObject;
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

export type SchemaObject =
  & {
    $ref?: string;
    format?: DataTypeFormats;
    description?: string;
    discriminator?: string;
    read_only?: boolean;
    xml?: XMLObject;
    external_docs?: ExternalDocumentationObject;
    example?: unknown;
    required?: string[];
    type?: PrimitiveTypes;
    collection_format?: CollectionFormatTypes;
  }
  & JsonSchema
  & JsonSchemaValidation;

export type XMLObject = {
  name?: string;
  namespace: string;
  prefix: string;
  attribute: boolean;
  wrapped: boolean;
};

export interface JsonSchema {
  items?: ItemsObject;
  all_of?: unknown[]; // TODO(crookse) What is this?
  properties?: { [property: string]: SchemaObject };
  additional_properties?: { [property: string]: SchemaObject };
}

export interface ResponseObject {
  description: string;
  schema?: SchemaObject;
  headers?: HeadersObject;
  examples?: ExampleObject;
}

export interface ExampleObject {
  [mime_type: string]: unknown;
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

export type DataTypeFormats =
  | "integer"
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
  type?: ItemsObjectTypes;
  format?: DataTypeFormats;
  /** Required if `type` is "array". */
  items?: ItemsObject;
  /** Determines the format of the array if `type` is "array". */
  collection_format?: CollectionFormatTypes;
  $ref?: string;
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
