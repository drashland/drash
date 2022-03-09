
import { DataTypeBuilder } from "./builders/data_type_builder.ts";
import { SwaggerObjectBuilder } from "./builders/swagger_object_builder.ts";
import { SchemaObjectTypeArrayBuilder } from "./builders/schema_object_type_array_builder.ts";
import { SchemaObjectTypeObjectBuilder } from "./builders/schema_object_type_object_builder.ts";
import { PathItemObjectBuilder } from "./builders/path_item_object_builder.ts";
import { OperationObjectBuilder } from "./builders/operation_object_builder.ts";
import { ResponseObjectBuilder } from "./builders/response_object_builder.ts";
import { ParameterInQueryObjectBuilder } from "./builders/parameter_object_in_query_builder.ts";
import { ParameterInBodyObjectBuilder } from "./builders/parameter_object_in_body_builder.ts";
import { ParameterInHeaderObjectBuilder } from "./builders/parameter_object_in_header_builder.ts";
import { ParameterInFormDataObjectBuilder } from "./builders/parameter_object_in_form_data_builder.ts";
import { ParameterInPathObjectBuilder } from "./builders/parameter_object_in_path_builder.ts";

export function swagger(spec: any): SwaggerObjectBuilder {
  return new SwaggerObjectBuilder(spec);
}

export function header(): ParameterInHeaderObjectBuilder {
  return new ParameterInHeaderObjectBuilder();
}

export function path(): ParameterInPathObjectBuilder {
  return new ParameterInPathObjectBuilder();
}

export function formData(): ParameterInFormDataObjectBuilder {
  return new ParameterInFormDataObjectBuilder();
}

export function query(): ParameterInQueryObjectBuilder {
  return new ParameterInQueryObjectBuilder();
}

export function body(): ParameterInBodyObjectBuilder {
  return new ParameterInBodyObjectBuilder();
}

export function response(): ResponseObjectBuilder {
  return new ResponseObjectBuilder();
}

export function object(properties?: any): SchemaObjectTypeObjectBuilder {
  const o = new SchemaObjectTypeObjectBuilder();
  if (properties) {
    o.properties(properties);
  }
  return o;
}

export function pathItem(): PathItemObjectBuilder {
  return new PathItemObjectBuilder();
}

export function operation(): OperationObjectBuilder {
  return new OperationObjectBuilder();
}

export function array(items?: any): SchemaObjectTypeArrayBuilder {
  const a = new SchemaObjectTypeArrayBuilder();
  if (items) {
    a.items(items);
  }
  return a;
}

export function string(): DataTypeBuilder {
  return new DataTypeBuilder("string");
}

export function integer(): DataTypeBuilder {
  return new DataTypeBuilder("integer");
}

export function long(): DataTypeBuilder {
  return new DataTypeBuilder("long");
}

export function float(): DataTypeBuilder {
  return new DataTypeBuilder("float");
}

export function double(): DataTypeBuilder {
  return new DataTypeBuilder("double");
}

export function byte(): DataTypeBuilder {
  return new DataTypeBuilder("byte");
}

export function binary(): DataTypeBuilder {
  return new DataTypeBuilder("binary");
}

export function boolean(): DataTypeBuilder {
  return new DataTypeBuilder("boolean");
}

export function date(): DataTypeBuilder {
  return new DataTypeBuilder("date");
}

export function dateTime(): DataTypeBuilder {
  return new DataTypeBuilder("dateTime");
}

export function password(): DataTypeBuilder {
  return new DataTypeBuilder("password");
}