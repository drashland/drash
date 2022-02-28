import * as Drash from "../../../../mod.ts";
import { SwaggerUIResource } from "./resources/swagger_ui_resource.ts";
import { PrimitiveDataTypeBuilder } from "./builders/primitive_type_builder.ts";
import {
  SchemaObjectBuilder,
  SchemaTypeArrayObjectBuilder,
} from "./builders/schema_object_builder.ts";
import { SwaggerObjectBuilder } from "./builders/swagger_object_builder.ts";
import { PathItemObjectBuilder } from "./builders/path_item_object_builder.ts";
import { OperationObjectBuilder } from "./builders/operation_object_builder.ts";
import { ResponseObjectBuilder } from "./builders/response_object_builder.ts";
import {
  ParameterInBodyObjectBuilder,
  ParameterInHeaderObjectBuilder,
  ParameterInPathObjectBuilder,
  ParameterInQueryObjectBuilder,
  ParameterInFormDataObjectBuilder,
} from "./builders/parameter_object_builder.ts";
import { IBuilder } from "./interfaces.ts";

export let pathToSwaggerUI: string;
export const specs = new Map<string, string>();

export function getSpecURLS(): string {
  const urls: {
    url: string;
    name: string;
  }[] = [];
  specs.forEach((spec: string) => {
    const json = JSON.parse(spec) as any;
    urls.push({
      name: `${json.info.title} ${json.info.version}`,
      url: `/swagger-ui-${json.info.title}-${json.info.version}.json`,
    });
  });
  return JSON.stringify(urls);
}

function isBuilder(obj: unknown): obj is IBuilder {
  return !!obj && typeof obj === "object" && "toJson" in obj;
}

/**
 * Build the specification. This could be the `SwaggerObjectBuilder` or an
 * object of key-value pairs that holds nested builders.
 */
export function buildSpec(obj: unknown, spec: any = {}): any {
  // Check if a builder was provided
  if (isBuilder(obj)) {
    return {
      ...spec,
      ...obj.toJson(),
    };
  }

  // Otherwise, we know that this is a key-value pair object with builders
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

export const types = {
  swagger(spec: any): SwaggerObjectBuilder {
    return new SwaggerObjectBuilder(spec);
  },
  parameters: {
    header(): ParameterInHeaderObjectBuilder {
      return new ParameterInHeaderObjectBuilder();
    },
    path(): ParameterInPathObjectBuilder {
      return new ParameterInPathObjectBuilder();
    },
    formData(): ParameterInFormDataObjectBuilder {
      return new ParameterInFormDataObjectBuilder();
    },
    query(): ParameterInQueryObjectBuilder {
      return new ParameterInQueryObjectBuilder();
    },
    body(): ParameterInBodyObjectBuilder {
      return new ParameterInBodyObjectBuilder();
    },
  },
  response(): ResponseObjectBuilder {
    return new ResponseObjectBuilder();
  },
  object(properties?: any): SchemaObjectBuilder {
    const o = new SchemaObjectBuilder("object");
    if (properties) {
      o.properties(properties);
    }
    return o;
  },
  pathItem(): PathItemObjectBuilder {
    return new PathItemObjectBuilder();
  },
  operation(): OperationObjectBuilder {
    return new OperationObjectBuilder();
  },
  array(items?: any): SchemaTypeArrayObjectBuilder {
    const a = new SchemaTypeArrayObjectBuilder();
    if (items) {
      a.items(items);
    }
    return a;
  },
  string(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("string");
  },
  integer(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("integer");
  },
  long(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("long");
  },
  float(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("float");
  },
  double(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("double");
  },
  byte(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("byte");
  },
  binary(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("binary");
  },
  boolean(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("boolean");
  },
  date(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("date");
  },
  dateTime(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("dateTime");
  },
  password(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("password");
  },
};

export interface OpenAPIV2ServiceOptions {
  /** Path to the Swagger UI page. Defaults to "/swagger-ui". */
  path?: string;
  spec?: string;
}

export class OpenAPIService extends Drash.Service {
  #specs: Map<string, SwaggerObjectBuilder> = new Map();
  #options: any;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options?: any) {
    super();
    this.#options = options ?? {};

    // Set the path to the Swagger UI page so that the resource can use it
    pathToSwaggerUI = this.#options.path ?? "/swagger-ui";
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC //////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public runAtStartup(options: any): void {
    console.log(`runAtStartup`)
    console.log(`options`, options);
    if (options.server) {
      options.server.addResource(SwaggerUIResource);
    }

    if (options.resources) {
      options.resources.forEach((resourceData: { resource: typeof Drash.Resource & Drash.Resource & { spec: string }}) => {
        // Get the spec
        const resource = resourceData.resource;
        console.log(`resource`, resource);
        const swaggerObjectBuilder = this.#specs.get(resource.spec);
        if (!swaggerObjectBuilder) {
          return;
        }
        // Start building out the spec
        // First, add this resource's paths
        resource.paths.forEach((path: string) => {
          const pathItemObjectBuilder = types.pathItem();
          [
            "GET",
            // TODO(crookse)
            // - Add all HTTP methods
          ].forEach((method: string) => {
            if (method in resource) {
              pathItemObjectBuilder.get(types.operation().responses({
                // Have a default OK response
                200: "OK"
              }))
            }
          });
          swaggerObjectBuilder.addPath(path, pathItemObjectBuilder);
        });

      });

      const spec = buildSpec(this.#specs.get("DRASH V1.0")!);
      const stringified = JSON.stringify(spec, null, 2);
      console.log(`stringified`, stringified);
      specs.set(`swagger-ui-${spec.info.title}-${spec.info.version}`, stringified);
      // console.log(buildSpec(swaggerObjectBuilder));
    }

    // After iterating through all of the resources, build the final swagger
    // objects to build a proper spec
  }

  /**
   * Create a specification. This call occurs before `runAtStartup()` is called
   * because resources are required to call it.
   *
   * TODO(crookse)
   * - Validate that the spec doesn't already exist
   * - Conver the spec to uppercase and use uppercase throughout the process
   */
  public createSpec(info: any): void {
    console.log("creating spec", info.title, info.version);
    this.#specs.set(this.#formatSpecName(info.title, info.version), types.swagger({
      info,
    }));
  }

  /**
   * Return a properly formed spec name. This spec name will be used in
   * `runAtStartup()` to build specs for resources that have specs.
   */
  public setSpec(name: string, version: string): string {
    return this.#formatSpecName(name, version).toUpperCase();
  }

  #formatSpecName(title: string, version: string): string {
    return `${title} ${version}`.toUpperCase();
  }
}

class SpecBuilder {

}
