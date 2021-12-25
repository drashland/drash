import { Drash } from "../../deps.ts";
import * as Types from "./types.ts";

type HttpMethodHandler = (
  request: Drash.Request,
  response: Drash.Response
) => Promise<void> | void;

export type OpenAPIResource = {
  spec: Builder;
} & Drash.Resource & OpenAPISpec;

export type OpenAPISpec = {
  oas_operations: {
     [key in Drash.Types.THttpMethod]?: Types.OperationObject & {
       responses?: Types.ResponsesObject
     };
  };
};

export class Builder {
  public spec: any = {
    swagger: "2.0",
    schemes: ["http"],
    paths: {},
  };

  current_tags: string[] = [];

  current_resource?: OpenAPIResource;

  constructor(info: Types.InfoObject) {
    this.spec.info = info;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - HTTP METHODS / OPERATION OBJECT METHODS /////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public post(
    operation: Partial<Types.OperationObject>,
    handler: HttpMethodHandler
  ): HttpMethodHandler {
    return this.#operation(
      "POST",
      operation,
      handler
    );
  }

  setRequiredOperationObjectFields(operation: Partial<Types.OperationObject>): void {
    if (Object.keys(operation).length === 0) {
      operation = {
        responses: {
          200: {
            description: "Successful"
          },
        }
      }
    }
  }

  public get(
    operation: Partial<Types.OperationObject>,
    handler: HttpMethodHandler
  ): HttpMethodHandler {
    return this.#operation(
      "GET",
      operation,
      handler
    );
  }

  #operation(
    method: Drash.Types.THttpMethod,
    operation: Partial<Types.OperationObject>,
    handler: HttpMethodHandler,
  ): HttpMethodHandler {
    this.setRequiredOperationObjectFields(operation);

    if (
      // If this resource does not call `spec.document()`, then we cannot
      // document this operation. Reason being `spec.document()` sets
      // `this.current_resource`. If `this.current_resource` is not set, then we
      // have no idea what resource this operation belongs to.
      !this.current_resource
      // `spec.document()` needs to be called on the `spec` property on the
      // resource. Otherwise, we cannot proceed to document the resource.
      || !this.current_resource.spec
    ) {
      return handler;
    }

    // By this time, the Operation Object will have all required fields because `this.setRequiredOperationObjectFields()` will add them
    this.current_resource.oas_operations[method] = operation as Types.OperationObject;

    return handler;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Document this resource as much as possible.
   *
   * @param resource The resource the document.
   * @returns 
   */
   public document(resource: Drash.Resource): void {
     // We cannot document things like request and response bodies because we
     // have no idea what those look like at this time. Request and response
     // documentation are added using `this.operation()`. However, we can
     // document things like path params and what HTTP methods are in the
     // resource -- those we have access to.
    this.current_resource = resource as OpenAPIResource;
    this.current_resource.oas_operations = {};
  }

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
      name: string,
      type: Types.ParameterTypes
      // Optional because we set these in the returned object
      in?: "query",
    }
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
      name: string,
      type: Types.ParameterTypes
      // Optional because we set these in the returned object
      in?: "formData",
    }
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
    fields: Partial<Types.ItemsObject> = {}
  ): Types.ItemsObject {
    return {
      ...fields,
      type,
    }
  }

  public itemsString(
    fields: Partial<Types.ItemsObject> = {}
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
    this.spec.basePath = basePath;
  }

  public schema(
    type: Types.PrimitiveTypes,
    fields: {[field: string]: unknown} = {},
  ): Types.SchemaObject {
    return {
      ...fields,
      type,
    };
  }

  public property(
    type: Types.PrimitiveTypes,
    fields: {[field: string]: unknown} = {},
  ): Types.SchemaObject {
    return {
      ...fields,
      type,
    };
  }

  public schemes(schemes: Types.SchemeTypes[]): void {
    this.spec.schemes = schemes;
  }

  public host(host: string): void {
    if (!this.spec.host) {
      this.spec.host = host
        .replace(/^(http|https)\:\/\//g, "")
        .replace("0.0.0.0", "localhost");
    }
  }

  public build(): string {
    const camelized = this.camelize(this.spec);
    return JSON.stringify(camelized, null, 2);
  }

  public camelize(o: any): any {
    const toCamel = (s: string) => {
      return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
      });
    };

    if (typeof o === "object" && !Array.isArray(o)) {
      const n: any = {};
  
      Object.keys(o)
        .forEach((k) => {
          n[toCamel(k)] = this.camelize(o[k]);
        });
  
      return n;
    } else if (Array.isArray(o)) {
      return o.map((i) => {
        return this.camelize(i);
      });
    }
  
    return o;
  };

  /**
   * Create a Paths Object with an empty Path Item Object. Use `this.pathItemObject()` to insert a Path Item Object into this Paths Object.
   * @param path
   */
  public pathsObject(
    path: string
  ): void {
    this.spec.paths[path] = {};
  }

  public pathItemObject(
    path: string,
    method: string,
    operation: Types.OperationObject,
    parameters: Types.ParameterObject[],
  ): void {
    this.spec.paths[path][method.toLowerCase()] = {
      ...operation,
      tags: [
        ...operation.tags ?? [],
        ...this.current_tags,
      ],
      parameters,
    };
  }
}

class BodyBuilder {
  public spec: Types.ParameterObjectInBody = {
    in: "body",
    name: "Body",
    schema: {
      type: "object",
    }
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
        type: schema
      }
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
   * 
   * Use only if the body is of type "array". Otherwise, this has no effect.
   * @param items 
   * @returns 
   */
  public items(items: {[key: string]: Types.ItemsObject}) {
    return {
      items,
    }
  }

  public build(): Types.ParameterObjectInBody {
    return this.spec;
  }
}
