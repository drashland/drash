import { DataTypeBuilder } from "./builders/data_type_builder.ts";
import { OperationObjectBuilder } from "./builders/operation_object_builder.ts";
import { ParameterInBodyObjectBuilder } from "./builders/parameter_object_in_body_builder.ts";
import { ParameterInFormDataObjectBuilder } from "./builders/parameter_object_in_form_data_builder.ts";
import { ParameterInHeaderObjectBuilder } from "./builders/parameter_object_in_header_builder.ts";
import { ParameterInPathObjectBuilder } from "./builders/parameter_object_in_path_builder.ts";
import { ParameterInQueryObjectBuilder } from "./builders/parameter_object_in_query_builder.ts";
import { PathItemObjectBuilder } from "./builders/path_item_object_builder.ts";
import { ResponseObjectBuilder } from "./builders/response_object_builder.ts";
import { SchemaObjectTypeArrayBuilder } from "./builders/schema_object_type_array_builder.ts";
import { SchemaObjectTypeObjectBuilder } from "./builders/schema_object_type_object_builder.ts";
import { SwaggerObjectBuilder } from "./builders/swagger_object_builder.ts";
import * as Types from "./types.ts";
import * as Interfaces from "./interfaces.ts";

/**
 * @returns A builder to help build a Schema Object of type array..
 */
export function array(
  items?: Interfaces.IBuilder,
): SchemaObjectTypeArrayBuilder {
  const a = new SchemaObjectTypeArrayBuilder();
  if (items) {
    a.items(items);
  }
  return a;
}
/**
 * @returns A builder to help build a Data Type of type binary.
 */
export function binary(): DataTypeBuilder {
  return new DataTypeBuilder("binary");
}
/**
 * @returns A builder to help build a Paramter Object with "in" as "body".
 */
export function body(): ParameterInBodyObjectBuilder {
  return new ParameterInBodyObjectBuilder();
}
/**
 * @returns A builder to help build a Data Type of type boolean.
 */
export function boolean(): DataTypeBuilder {
  return new DataTypeBuilder("boolean");
}
/**
 * @returns A builder to help build a Data Type of type byte.
 */
export function byte(): DataTypeBuilder {
  return new DataTypeBuilder("byte");
}
/**
 * @returns A builder to help build a Data Type of type date.
 */
export function date(): DataTypeBuilder {
  return new DataTypeBuilder("date");
}
/**
 * @returns A builder to help build a Data Type of type dateTime.
 */
export function dateTime(): DataTypeBuilder {
  return new DataTypeBuilder("dateTime");
}
/**
 * @returns A builder to help build a Data Type of type double.
 */
export function double(): DataTypeBuilder {
  return new DataTypeBuilder("double");
}
/**
 * @returns A builder to help build a Data Type of type float.
 */
export function float(): DataTypeBuilder {
  return new DataTypeBuilder("float");
}
/**
 * @returns A builder to help build a Parameter Object with "in" as "formData".
 */
export function formData(): ParameterInFormDataObjectBuilder {
  return new ParameterInFormDataObjectBuilder();
}
/**
 * @returns A builder to help build a Parameter Object with "in" as "header".
 */
export function header(): ParameterInHeaderObjectBuilder {
  return new ParameterInHeaderObjectBuilder();
}
/**
 * @returns A builder to help build a Data Type of type integer.
 */
export function integer(): DataTypeBuilder {
  return new DataTypeBuilder("integer");
}
/**
 * @returns A builder to help build a Data Type of type long.
 */
export function long(): DataTypeBuilder {
  return new DataTypeBuilder("long");
}
/**
 * @returns A builder to help build a Schema Object of type object.
 */
export function object(properties?: any): SchemaObjectTypeObjectBuilder {
  const o = new SchemaObjectTypeObjectBuilder();
  if (properties) {
    o.properties(properties);
  }
  return o;
}
/**
 * @returns A builder to help build an Operation Object.
 */
export function operation(): OperationObjectBuilder {
  return new OperationObjectBuilder();
}
/**
 * @returns A builder to help build a Data Type of password.
 */
export function password(): DataTypeBuilder {
  return new DataTypeBuilder("password");
}
/**
 * @returns A builder to help build a Parameter Object with "in" as "path".
 */
export function path(): ParameterInPathObjectBuilder {
  return new ParameterInPathObjectBuilder();
}
/**
 * @returns A builder to help build a Path Item Object.
 */
export function pathItem(): PathItemObjectBuilder {
  return new PathItemObjectBuilder();
}
/**
 * @returns A builder to help build a Parameter Object with "in" as "query".
 */
export function query(): ParameterInQueryObjectBuilder {
  return new ParameterInQueryObjectBuilder();
}
/**
 * @returns A builder to help build a Response Object.
 */
export function response(): ResponseObjectBuilder {
  return new ResponseObjectBuilder();
}
/**
 * @returns A builder to help build a Data Type of type string.
 */
export function string(): DataTypeBuilder {
  return new DataTypeBuilder("string");
}
/**
 * @returns A builder to help build a Swagger Object.
 */
export function swagger(spec: any): SwaggerObjectBuilder {
  return new SwaggerObjectBuilder(spec);
}
