import * as Types from "../types.ts";
import { ItemsObjectWithJsonSchemaValidationBuilder } from "./items_object_with_json_schema_validation_builder.ts";

export class ItemsObjectBuilder
  extends ItemsObjectWithJsonSchemaValidationBuilder {
  #items?: ItemsObjectBuilder;

  // FILE MARKER: TYPE ARRAY

  public type(type: Types.ItemsObjectTypes): this {
    this.spec.type = type;

    if (this.spec.type === "array") {
      this.collectionFormat("csv");
    }

    return this;
  }

  public collectionFormat(value: Types.CollectionFormatTypes): this {
    this.spec.collection_format = value;
    return this;
  }

  public items(builder: ItemsObjectBuilder): this {
    this.#items = builder;
    return this;
  }

  public toJson(): Types.ItemsObject {
    if (this.spec.type === "array") {
      return this.#toTypeArrayJson();
    }

    return this.spec as Types.ItemsObject;
  }

  #toTypeArrayJson(): Types.ItemsObject {
    if (!this.#items) {
      throw new Error(
        `Items Object of type array is invalid.\n` +
          `Method \`.items()\` was not called. Example usage:\n\n` +
          `  items().array().items( ... )`,
      );
    }
    return this.spec as Types.ItemsObject;
  }
}
