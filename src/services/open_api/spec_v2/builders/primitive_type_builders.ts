import * as Types from "../types.ts";

type Meta = {
  required: boolean;
};

export type PrimitiveTypeBuilders = {
  [key: string]: PrimitiveTypeBuilder | Types.PrimitiveTypes;
};

/**
 * Base class for all primitive type builders. Primitive types in OpenAPI are:
 *   - string
 *   - object
 *   - array
 *   - boolean
 *   - number
 *   - integer
 */
export abstract class PrimitiveTypeBuilder {
  public meta: Meta = {
    required: false,
  };

  public required(): this {
    this.meta.required = true;
    return this;
  }

  abstract toJson(): Types.SchemaObject;
}

/**
 * Builder to help build arrays to spec.
 */
export class ArrayBuilder extends PrimitiveTypeBuilder {
  #items?: PrimitiveTypeBuilder | Types.ReferenceObject;

  public items(items: PrimitiveTypeBuilder | Types.ReferenceObject): this {
    this.#items = items;
    return this;
  }

  public toJson(): Types.SchemaObject {
    return {
      type: "array",
      items: this.#buildItems(),
    };
  }

  #buildItems(): Types.ItemsObject {
    if (!this.#items) {
      throw new Error(
        `Array requires 'items' field.`,
      );
    }

    if (this.#items instanceof ArrayBuilder) {
      return {
        type: "array",
        items: this.#items.#buildItems(),
      };
    }

    if (this.#items instanceof BooleanBuilder) {
      return {
        type: "boolean",
      };
    }

    if (this.#items instanceof StringBuilder) {
      return {
        type: "string",
      };
    }

    if ("$ref" in this.#items) {
      return this.#items;
    }

    throw new Error(
      "`items` is an unknown type. Allowed types are: string, number, integer, boolean, array, $ref",
    );
  }
}

/**
 * Builder to help build booleans to spec.
 */
export class BooleanBuilder extends PrimitiveTypeBuilder {
  public toJson(): Types.SchemaObject {
    return {
      type: "boolean",
    };
  }
}

/**
 * Builder to help build strings to spec.
 */
export class StringBuilder extends PrimitiveTypeBuilder {
  public toJson(): Types.SchemaObject {
    return {
      type: "string",
    };
  }
}

/**
 * Builder to help build objects to spec.
 */
export class ObjectBuilder extends PrimitiveTypeBuilder {
  #properties: PrimitiveTypeBuilders = {};

  public properties(properties: PrimitiveTypeBuilders): this {
    this.#properties = properties;
    return this;
  }

  toJson(): Types.SchemaObject {
    const ret: Types.SchemaObject = {
      type: "object",
      required: [],
      properties: {},
    };

    for (const key in this.#properties) {
      const value = this.#properties[key] as PrimitiveTypeBuilder;
      if (value.meta.required) {
        ret.required!.push(key);
      }
      ret.properties![key] = value.toJson();
    }

    return ret;
  }
}
