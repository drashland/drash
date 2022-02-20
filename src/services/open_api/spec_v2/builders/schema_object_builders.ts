import * as Types from "../types.ts";
import { SchemaObjectTypeArrayBuilder } from "./schema_object_type_array_builder.ts";

export class SchemaObjectBuilder {
  // FILE MARKER: TYPE ARRAY

  #items?: ItemsObjectWithJsonSchemaValidationBuilder;

  public items(builder: ItemsObjectWithJsonSchemaValidationBuilder): this {
    this.#items = builder;
    return this;
  }

  toJson(): Types.SchemaObject {
    if (this.spec.type === "array") {
      return this.#toJsonArray();
    }

    return this.spec as Types.SchemaObject;
  }

  #toJsonArray(): Types.SchemaObject {
    this.#buildItems();
    return this.spec as Types.SchemaObject;
  }

  #buildItems(): void {
    if (!this.#items) {
      throw new Error(
        "Schema Object of type array is invalid.\n" +
          "Method `items()` was not called. Example usage:\n\n" +
          "  .schema().array().items( ... )",
      );
    }

    this.spec.items = this.#items.toJson();
  }
}
