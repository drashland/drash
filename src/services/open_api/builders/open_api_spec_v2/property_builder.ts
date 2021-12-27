import * as Types from "./types.ts"

export function array(items: PrimitiveTypeBuilder): ArrayBuilder {
  return new ArrayBuilder(items);
}

export function boolean(): BooleanBuilder {
  return new BooleanBuilder();
}

export function string(): StringBuilder {
  return new StringBuilder();
}

export function object(properties: PrimitiveTypeBuilders): ObjectBuilder {
  return new ObjectBuilder(properties);
}

type Meta = {
  required: boolean;
}

abstract class PrimitiveTypeBuilder {
  #meta: Meta = {
    required: false,
  }

  get meta(): Meta {
    return this.#meta;
  }

  public required(): this {
    this.#meta.required = true;
    return this;
  }

  abstract toJson(): Types.SchemaObject;
}

export type PrimitiveTypeBuilders = {
  [key: string]: PrimitiveTypeBuilder | Types.PrimitiveTypes
}

export class ArrayBuilder extends PrimitiveTypeBuilder {
  #items: PrimitiveTypeBuilder;

  constructor(items: PrimitiveTypeBuilder) {
    super();
    this.#items = items;
  }

  public toJson(): Types.SchemaObject {
    return {
      type: "array",
      items: this.itemsToSpec(),
    };
  }

  public itemsToSpec(): Types.ItemsObject {
    if (this.#items instanceof ArrayBuilder) {
      return {
        type: "array",
        items: this.#items.itemsToSpec(),
      }
    }

    if (this.#items instanceof StringBuilder) {
      return {
        type: "string"
      }
    }

    throw new Error("`items` is an unknown type.");
  }
}

export class BooleanBuilder extends PrimitiveTypeBuilder {
  public toJson(): Types.SchemaObject {
    return {
      type: "boolean",
    }
  }
}

export class StringBuilder extends PrimitiveTypeBuilder {
  public toJson(): Types.SchemaObject {
    return {
      type: "string",
    }
  }
}

type JsonObject = Record<string, string | object>

export class ObjectBuilder extends PrimitiveTypeBuilder {
  properties: PrimitiveTypeBuilders;

  constructor(properties: PrimitiveTypeBuilders = {}) {
    super();
    this.properties = properties;
  }

  toJson(): Types.SchemaObject {
    const ret: Types.SchemaObject = {
      type: "object",
      required: [],
      properties: {},
    };

    for (const key in this.properties) {
      const value = this.properties[key] as PrimitiveTypeBuilder;
      if (value.meta.required) {
        ret.required!.push(key);
      }
      ret.properties![key] = value.toJson();
    }

    return ret;
  }
}

export type PropertyObject = {
  type: string;
}