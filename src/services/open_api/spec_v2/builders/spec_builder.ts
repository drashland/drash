import * as Drash from "../../../../../mod.ts";
import * as Types from "../types.ts";
import * as PrimitiveTypeBuilders from "./primitive_type_builders.ts";
import { SchemaObjectBuilder } from "./schema_object_builder.ts";

export type ObjectToCamelize = { [k: string]: unknown | unknown[] } | unknown[];

export class SpecBuilder {
  public spec: Partial<Types.OpenAPISpecV2> & {
    // This is the only required field needed to produce documentation for resources
    paths: Types.PathsObject;
  } = {
    swagger: "2.0",
    schemes: ["http"],
    base_path: "/",
    paths: {},
    definitions: {},
    responses: {},
    tags: [],
    security_definitions: {},
    security: [],
    consumes: [],
    produces: [],
  };

  current_resource?: Types.OpenAPIResource;

  current_tags: string[] = [];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class and set the given Info Object.
   * @param info The Info Object to set in the Spec's `info` property. This argument requires the `title` and `version` fields at the very least.
   */
  constructor(info: Types.InfoObject) {
    this.spec.info = info;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIMITIVE BUILDERS //////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get the `spec` property.
   * @param resource
   */
  public getSpec(): Partial<Types.OpenAPISpecV2> {
    return this.spec;
  }

  /**
   * Document this resource as much as possible.
   *
   * @param resource The resource the document.
   * @returns
   */
  public setCurrentResource(resource: Drash.Resource): void {
    // We cannot document things like request and response bodies because we
    // have no idea what those look like at this time. Request and response
    // documentation are added using `this.#operation()`. However, we can
    // document things like path params and what HTTP methods are in the
    // resource -- those we have access to.
    this.current_resource = resource as Types.OpenAPIResource;
    this.current_resource.oas_operations = {};
  }

  /**
   * Apply all given tags to all operations in a resource.
   *
   * @param tags The tags to apply to all operations.
   * @returns
   */
  public allTags(tags: string[]): this {
    this.current_tags = tags;
    return this;
  }

  public app(info: Types.InfoObject): void {
    this.spec.info = info;
  }

  public info(title: string, version: string): Types.InfoObject {
    return {
      title,
      version,
    };
  }

  public response(
    description: string,
    fields: Types.ResponseObject = {
      description: "",
    },
  ): Types.ResponseObject {
    return {
      ...fields,
      description,
    };
  }

  public query(
    fields: Partial<Types.ParameterObjectInQuery> & {
      // Required fields
      name: string;
      type: Types.ParameterTypes;
      // Optional because we set these in the returned object
      in?: "query";
    },
  ): Types.ParameterObjectInQuery {
    if (fields.type === "array") {
      if (!fields.collection_format) {
        fields.collection_format = "csv";
      }
      if (fields.items && fields.items.type === "array") {
        if (!fields.items.collection_format) {
          fields.items.collection_format = "csv";
        }
      }
    }

    return {
      ...fields,
      in: "query",
    };
  }

  public formData(
    fields: Partial<Types.ParameterObjectInQuery> & {
      // Required fields
      name: string;
      type: Types.ParameterTypes;
      // Optional because we set these in the returned object
      in?: "formData";
    },
  ): Types.ParameterObjectInFormData {
    return {
      ...fields,
      in: "formData",
    };
  }

  public body(): BodyBuilder {
    return new BodyBuilder();
  }

  // public body(
  //   fields: Partial<Types.SchemaObject> & {
  //     // Required fields
  //     // Optional because we set these in the returned object
  //     in?: "body",
  //     name?: string,
  //   }
  // ): Types.ParameterObject {
  //   return {
  //     ...fields,
  //     name: "Payload",
  //     in: "body",
  //   };
  // }

  public items(
    type: "string" | "number" | "integer" | "boolean" | "array",
    fields: Partial<Types.ItemsObject> = {},
  ): Types.ItemsObject {
    return {
      ...fields,
      type,
    };
  }

  public definitions(
    definitions: { [definitionName: string]: Types.DefinitionObject },
  ): this {
    if (!this.spec.definitions) {
      this.spec.definitions = {};
    }

    this.spec.definitions = {
      ...this.spec.definitions,
      ...definitions,
    };

    return this;
  }

  /**
   * Create a Definition Object, which is the same thing as a Schema Object. This method only exists to introduce a semantic method name when creating definitions.
   * @param fields
   * @returns
   */
  public definition(
    type: Types.PrimitiveTypes,
    fields: Partial<Types.DefinitionObject> = {},
  ): Types.DefinitionObject {
    return this.schema(type, fields);
  }

  public itemsString(
    fields: Partial<Types.ItemsObject> = {},
  ): Types.ItemsObject {
    return {
      ...fields,
      type: "string",
    };
  }

  // public itemsArray(
  //   items: Partial<Types.ItemsObject>
  // ): Types.ItemsObject {
  //   if (!items.collection_format) {
  //     items.collection_format = "csv";
  //   }

  //   return {
  //     items: {...items},
  //     type: "array",
  //   };
  // }

  resetCurrentFields(): void {
    this.current_resource = undefined;
    this.current_tags = [];
  }

  public basePath(basePath: string): void {
    this.spec.base_path = basePath;
  }

  /**
   * @param type
   * @param fields
   * @returns
   */
  public schema(
    type: Types.PrimitiveTypes,
    fields: Partial<Types.SchemaObject> = {},
  ): Types.SchemaObject {
    return {
      ...fields,
      type,
    };
  }

  /**
   * Create a Schema Object to be set in the a `property` field.
   * @param type
   * @param fields
   * @returns
   */
  public property(
    type: Types.PrimitiveTypes,
    fields: Partial<Types.SchemaObject> = {},
  ): Types.SchemaObject {
    return this.schema(type, fields);
  }

  /**
   * Add the `schemes` to the spec.
   *
   * @param schemes An array of acceptable OpenAPI 2.0 Spec schemes.
   */
  public schemes(schemes: Types.SchemeTypes[]): void {
    this.spec.schemes = schemes;
  }

  /**
   * @param host The `host` field in the OpenAPI Spec.
   */
  public host(host: string): void {
    if (!this.spec.host) {
      this.spec.host = host
        .replace(/^(http|https)\:\/\//g, "")
        .replace("0.0.0.0", "localhost");
    }
  }

  /**
   * Build the OpenAPI Spec JSON string.
   *
   * @returns A JSON string representation of the OpenAPI Spec object.
   */
  public toJson(): string {
    const spec = this.convertFieldNamesToSpec(this.spec);
    return JSON.stringify(spec, null, 2);
  }

  /**
   * Convert the given object's field names to meet Spec.
   *
   * @param objectToConvert The object to convert to Spec.
   * @returns The `objectToConvert` with field names meeting Spec.
   */
  public convertFieldNamesToSpec(
    objectToConvert: ObjectToCamelize,
  ): ObjectToCamelize {
    const convertField = (s: string) => {
      // Convert HTTP method name to lowercase. Spec requires lowercase HTTP method names.
      if (Drash.Types.THttpMethodArray.includes(s)) {
        return s.toLowerCase();
      }

      return s.replace(/([-_][a-z])/ig, (field: string) => {
        // Convert field to camel case. Spec requires camel case field names.
        return field.toUpperCase()
          .replace("-", "")
          .replace("_", "");
      });
    };

    if (
      typeof objectToConvert === "object" && !Array.isArray(objectToConvert)
    ) {
      const convertedObject: { [key: string]: ObjectToCamelize } = {};

      Object.keys(objectToConvert)
        .forEach((field: string) => {
          convertedObject[convertField(field)] = this.convertFieldNamesToSpec(
            objectToConvert[field] as ObjectToCamelize,
          );
        });

      return convertedObject;
    }

    if (Array.isArray(objectToConvert)) {
      return objectToConvert.map((nestedObject: ObjectToCamelize) => {
        return this.convertFieldNamesToSpec(nestedObject);
      });
    }

    return objectToConvert;
  }

  /**
   * Create a Paths Object with an empty Path Item Object. Use `this.pathItemObject()` to insert a Path Item Object into this Paths Object.
   * @param path
   */
  public pathsObject(
    path: string,
  ): void {
    this.spec.paths[path] = {};
  }

  // public array(fields: {
  //   type: Types.ItemsObjectTypes,
  //   required?: boolean,
  // }): PropertyArray {
  //   return {
  //     ...fields,
  //     type: "array",
  //     required: fields.required ?? false,
  //     items: {
  //       type: fields.type
  //     }
  //   }
  // }

  // public requestBody(
  //   builders: PrimitiveTypeBuilders.ObjectBuilder
  // ): Types.ParameterObjectInBody {

  //   const schemaObject = new SchemaObjectBuilder(builders).toJson();

  //   return {
  //     name: "Body Payload",
  //     in: "body",
  //     schema: schemaObject,
  //   }
  // }
  //   const schema: Types.SchemaObject = {};

  //   for (const field in fields) {
  //     const value = fields[field];
  //     if (typeof value === "object") {
  //       if (Array.isArray(value)) {
  //         schema[field] =
  //       }

  //     }
  //     if () {
  //       continue;
  //     }
  //     schema[field] = fields[field];
  //   }
  // }

  public pathItemObject(
    path: string,
    method: string,
    operation: Types.OperationObject,
  ): void {
    if (!this.spec.paths[path]) {
      this.spec.paths[path] = {};
    }
    this.spec.paths[path][method as Drash.Types.THttpMethod] = {
      ...operation,
      tags: [
        ...operation.tags ?? [],
        ...this.current_tags,
      ],
    };
  }

  /**
   * Create an Operation Object for the given method on the current resource.
   *
   * @param method An HTTP method (capitalized).
   * @param operation The Operation Object the given method is associated with.
   * @param handler The request-response handler for a Drash resource.
   * @returns The request-response handler for the Drash resource. This handler is what Drash performs in `Drash.Server`.
   */
  operation(
    method: Drash.Types.THttpMethod,
    operation: Partial<Types.OperationObject>,
  ): void {
    this.#setRequiredOperationObjectFields(operation);
  }

  /**
   * Set the required fields on the given Operation Object. At the very least, an Operation Object requires the `responses` field.
   *
   * @param operation The operation to have fields set on it.
   */
  #setRequiredOperationObjectFields(
    operation: Partial<Types.OperationObject>,
  ): void {
    if (Object.keys(operation).length === 0) {
      operation = {
        responses: {
          200: {
            description: "Successful",
          },
        },
      };
    }
  }
}

class BodyBuilder {
  public spec: Types.ParameterObjectInBody = {
    in: "body",
    name: "Body",
    schema: {
      type: "object",
    },
  };

  /**
   * Use only if the body is of type "object". Otherwise, this has no effect.
   * @param properties
   * @returns
   */
  public property(
    property: string,
    schema: Types.PrimitiveTypes | Types.SchemaObject,
    required: boolean = false,
  ): this {
    this.spec.schema.type = "object";

    if (!this.spec.schema.properties) {
      this.spec.schema.properties = {};
    }

    if (typeof schema === "string") {
      this.spec.schema.properties[property] = {
        type: schema,
      };
    } else if (typeof schema === "object") {
      this.spec.schema.properties[property] = schema;
    }

    if (required === true) {
    }

    return this;
  }

  public required(required: string[]): this {
    this.spec.schema.required = required;
    return this;
  }

  /**
   * Use only if the body is of type "array". Otherwise, this has no effect.
   * @param items
   * @returns
   */
  public items(items: { [key: string]: Types.ItemsObject }) {
    return {
      items,
    };
  }

  public build(): Types.ParameterObjectInBody {
    return this.spec;
  }
}
