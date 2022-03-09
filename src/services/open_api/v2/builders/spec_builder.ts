import { IBuilder } from "../interfaces.ts";
import { TSwaggerObject } from "../types.ts";

/**
 * Build the specification. This could be the `SwaggerObjectBuilder` or an
 * object of key-value pairs that holds nested swagger.
 */
 export function buildSpec(obj: unknown, spec: any = {}): TSwaggerObject {
  // Check if a builder was provided. If a builder was provided, then convert it
  // to its JSON form.
  if (isBuilder(obj)) {
    return {
      ...spec,
      ...obj.toJson(),
    };
  }

  // Otherwise, this should be a key-value pair object with builders
  for (
    const [key, builder] of Object.entries(obj as Record<string, IBuilder>)
  ) {
    spec = {
      ...spec,
      [key]: builder.toJson(),
    };
  }

  return spec;
}

/**
 * Is the object in question of the `IBuilder` interface?
 * @param obj The object in question.
 * @returns True if yes, false if no.
 */
 export function isBuilder(obj: unknown): obj is IBuilder {
  return !!obj && typeof obj === "object" && "toJson" in obj;
}