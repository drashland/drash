import * as Types from "../types.ts";
import { ParameterObjectWithJsonSchemaValidationBuilder } from "./parameter_object_with_json_schema_validation_builder.ts";
import { ItemsObjectWithJsonSchemaValidationBuilder } from "./items_object_with_json_schema_validation_builder.ts";

export class ParameterObjectNonBodyBuilder extends ParameterObjectWithJsonSchemaValidationBuilder {
  #items?: ItemsObjectWithJsonSchemaValidationBuilder;

  constructor(inType: Types.ParameterInTypes) {
    super(inType);

    if (
      inType === "query" ||
      inType === "formData"
    ) {
      // Set defaults
      this.spec.allow_empty_value = false;
    }
  }

  public type(type: Types.ParameterTypes): this {
    if (type === "file") {
      if (this.spec.in != "formData") {
        throw new Error(
          'Parameter Object `in` field must be "formData" (e.g., OpenAPIService.parameter("formData")`)',
        );
      }
    }

    // According to Spec, default for `type: array` is `csv`
    if (type === "array") {
      this.collectionFormat("csv");
    }

    this.spec.type = type;

    return this;
  }

  public allowEmptyValue(value: boolean): this {
    this.spec.allow_empty_value = value;
    return this;
  }

  public collectionFormat(format: Types.CollectionFormatTypes): this {
    this.spec.collection_format = format;
    return this;
  }

  public format(format: Types.DataTypeFormats): this {
    this.spec.format = format;
    return this;
  }

  public default(value: unknown): this {
    this.spec.default = value;
    return this;
  }

  public items(builder: ItemsObjectWithJsonSchemaValidationBuilder): this {
    this.#items = builder;
    return this;
  }

  public toJson(): Types.ParameterObject {
    if (this.spec.type === "array") {
      return this.#toJsonArray();
    }

    this.validateSpec();

    return this.spec as Types.ParameterObject;
  }

  #toJsonArray(): Types.ParameterObject {
    if (!this.#items) {
      throw new Error(
        `Parameter Object of type array is invalid.\n`
        + `Method \`.items()\` was not called. Example usage:\n\n`
        + `  parameter().query().type("array").items( ... )`
      );
    }

    this.spec.items = this.#items.toJson();

    return this.spec as Types.ParameterObject;
  }

  protected validateSpec(): void {
    super.validateSpec();

    if (!this.spec.type) {
      throw new Error(`Field 'type' is required. Use \`.type()\`.`);
    }

    if (this.spec.collection_format && this.spec.type !== "array") {
      throw new Error(
        "Field `collectionFormat` cannot be used on types other than `array`.",
      );
    }

    if (this.spec.type === "array") {
      if (!this.spec.items) {
        throw new Error(
          `Invalid Parameter Object of type ${this.spec.type}.\n`
          + `Field 'items' is required. Use \`array().items( ... )\`.`,
        );
      }
    }
  }
}
