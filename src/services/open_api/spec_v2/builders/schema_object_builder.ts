import * as Types from "../types.ts";
import { SchemaObjectWithJsonSchemaValidationBuilder } from "./schema_object_with_json_schema_validation_builder.ts";
import { ItemsObjectBuilder } from "./items_object_builder.ts";

type PropertyBuilders = {
  [property: string]: unknown
}

export class SchemaObjectBuilder extends SchemaObjectWithJsonSchemaValidationBuilder {
  #items?: ItemsObjectBuilder;
  #properties?: PropertyBuilders;

  public required(required: string[]): this {
    this.spec.required = required;
    return this;
  }

  public ref(ref: string): this {
    this.spec.$ref = ref;
    return this;
  }

  public type(value: Types.PrimitiveTypes): this {
    this.spec.type = value;

    return this;
  }

  public properties(properties: PropertyBuilders): this {
    this.#properties = properties;
    return this;
  }

  public format(value: Types.DataTypeFormats): this {
    this.spec.format = value;
    return this;
  }

  public description(value: string): this {
    this.spec.description = value;
    return this;
  }

  public items(builder: ItemsObjectBuilder): this {
    this.#items = builder;
    return this;
  }

  toJson(): Types.SchemaObject {
    if (this.spec.type === "array") {
      return this.#toTypeArrayJson();
    }

    if (this.spec.type === "object") {
      return this.#toTypeObjectJson();
    }

    return this.spec as Types.SchemaObject;
  }

  #toTypeObjectJson(): Types.SchemaObject {
    this.#buildProperties();
    return this.spec as Types.SchemaObject;
  }

  #toTypeArrayJson(): Types.SchemaObject {
    this.#buildItems();
    return this.spec as Types.SchemaObject;
  }

  #buildProperties(): void {
    if (!this.#properties) {
      throw new Error(
        "Schema Object of type object is invalid.\n" +
        "Method `properties()` was not called. Example usage:\n\n" +
        "  .schema().type(\"object\").properties( ... )"
      );
    }

    this.spec.properties = {};

    for (const property in this.#properties) {
      // TODO(crookse) Check what type of builder this is
      const builder = this.#properties[property];
      // @ts-ignore
      this.spec.properties[property] = builder.toJson();
    }
  }

  #buildItems(): void {
    if (!this.#items) {
      throw new Error(
        "Schema Object of type array is invalid.\n" +
        "Method `items()` was not called. Example usage:\n\n" +
        "  .schema().type(\"array\").items( ... )"
      );
    }

    this.spec.items = this.#items.toJson();
  }
}
