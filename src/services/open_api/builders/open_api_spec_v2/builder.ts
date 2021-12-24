import { Drash } from "../../deps.ts";
import * as Types from "./types.ts";

type HttpMethodHandler = (
  request: Drash.Request,
  response: Drash.Response
) => Promise<void> | void;

export class Builder {
  public spec: any = {
    swagger: "2.0",
    schemes: ["http"],
    paths: {},
  };

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - HTTP METHODS ////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public post(
    documentation: any,
    httpMethodHandler: HttpMethodHandler
  ): HttpMethodHandler {
    return async function (
      request: Drash.Request,
      response: Drash.Response,
    ) {
      return await httpMethodHandler(request, response);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public swagger(info: Types.InfoObject): void {
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
    this.spec.host = host
      .replace(/^(http|https)\:\/\//g, "")
      .replace("0.0.0.0", "localhost");
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

  public pathsObject(
    path: string
  ): void {
    this.spec.paths[path] = {};
  }

  public pathItemObject(
    path: string,
    method: string,
    summary: string,
    description: string,
    responses: Types.ResponsesObject,
    parameters: Types.ParameterObject[],
  ): void {
    this.spec.paths[path][method.toLowerCase()] = {
      summary,
      description,
      parameters,
      responses,
    };
  }
}

class BodyBuilder {
  public spec: Types.ParameterObjectInBody = {
    in: "body",
    name: "Body",
    schema: {
      type: "object",
      properties: {},
    }
  };

  /**
   * Use only if the body is of type "object". Otherwise, this has no effect.
   * @param properties
   * @returns 
   */
  public property(
    property: string,
    schema: Types.SchemaObject
  ): this {
    this.spec.schema.type = "object";

    // @ts-ignore
    this.spec.schema.properties[property] = schema;

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