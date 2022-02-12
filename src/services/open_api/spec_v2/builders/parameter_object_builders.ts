import * as Types from "../types.ts";
import * as PrimtiveTypeBuilders from "./primitive_type_builders.ts";
import { ParameterObjectInQueryBuilder } from "./parameter_object_in_query_builder.ts";
import { ParameterObjectInBodyBuilder } from "./parameter_object_in_body_builder.ts";
import { ParameterObjectInFormDataBuilder } from "./parameter_object_in_form_data_builder.ts";
import { ParameterObjectInPathBuilder } from "./parameter_object_in_path_builder.ts";
import { ParameterObjectInHeaderBuilder } from "./parameter_object_in_header_builder.ts";

export class ParameterObjectBuilders {
  public inBody(): ParameterObjectInBodyBuilder {
    return new ParameterObjectInBodyBuilder();
  }

  public inFormData(): ParameterObjectInFormDataBuilder {
    return new ParameterObjectInFormDataBuilder();
  }

  public inHeader(): ParameterObjectInHeaderBuilder {
    return new ParameterObjectInHeaderBuilder();
  }

  public inQuery(): ParameterObjectInQueryBuilder {
    return new ParameterObjectInQueryBuilder();
  }

  public inPath(): ParameterObjectInPathBuilder {
    return new ParameterObjectInPathBuilder();
  }
}
