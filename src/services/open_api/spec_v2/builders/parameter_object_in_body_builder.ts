import * as Types from "../types.ts";
import { ParameterObjectBuilder } from "./parameter_object_builder.ts";
import * as PrimitiveTypeBuilders from "./primitive_type_builders.ts";
import { SchemaObjectWithJsonSchemaValidationBuilder } from "./schema_object_with_json_schema_validation_builder.ts";

export class ParameterObjectInBodyBuilder extends ParameterObjectBuilder {
  #schema?: SchemaObjectWithJsonSchemaValidationBuilder;
  constructor() {
    super("body");

    // Set defaults
    this.name("Request Body");
  }

  public schema(builder: SchemaObjectWithJsonSchemaValidationBuilder): this {
    this.#schema = builder;
    return this;
  }

  public toJson(): Types.ParameterObject {
    this.#buildSchema();

    return this.spec as Types.ParameterObject;
  }

  #buildSchema(): void {
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    console.log("test");
    if (!this.#schema) {
      throw new Error("Field `schema` is required. Use `.schema()`.");
    }

    this.spec.schema = this.#schema.toJson();
  }
}
