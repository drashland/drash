import * as Drash from "../../../../mod.ts";
import { SwaggerUIResource } from "./resources/swagger_ui_resource.ts";
import { DataTypeBuilder } from "./builders/data_type_builder.ts";
import { SchemaObjectTypeArrayBuilder } from "./builders/schema_object_type_array_builder.ts";
import { SchemaObjectTypeObjectBuilder } from "./builders/schema_object_type_object_builder.ts";
import { SwaggerObjectBuilder } from "./builders/swagger_object_builder.ts";
import { PathItemObjectBuilder } from "./builders/path_item_object_builder.ts";
import { OperationObjectBuilder } from "./builders/operation_object_builder.ts";
import { ResponseObjectBuilder } from "./builders/response_object_builder.ts";
import { ParameterInQueryObjectBuilder } from "./builders/parameter_object_in_query_builder.ts";
import { ParameterInBodyObjectBuilder } from "./builders/parameter_object_in_body_builder.ts";
import { ParameterInHeaderObjectBuilder } from "./builders/parameter_object_in_header_builder.ts";
import { ParameterInFormDataObjectBuilder } from "./builders/parameter_object_in_form_data_builder.ts";
import { ParameterInPathObjectBuilder } from "./builders/parameter_object_in_path_builder.ts";
import {
  IBuilder,
  IResourceWithSwagger
} from "./interfaces.ts";
import {
  TResourceHttpMethodSpec,
  TPathItemObjectBuilderHttpMethods,
} from "./types.ts";

type TStartupOptionsResources = {
  resource: typeof Drash.Resource & IResourceWithSwagger
}

export const serviceGlobals = {
  pathToSwaggerUI: "/swagger-ui",
  specifications: new Map<string, string>(),
}

export function getSpecURLS(): string {
  const urls: {
    url: string;
    name: string;
  }[] = [];
  serviceGlobals.specifications.forEach((spec: string) => {
    const json = JSON.parse(spec) as any;
    urls.push({
      name: `${json.info.title} ${json.info.version}`,
      url: `/swagger-ui-${json.info.title}-${json.info.version}.json`,
    });
  });
  return JSON.stringify(urls);
}

/**
 * Build the specification. This could be the `SwaggerObjectBuilder` or an
 * object of key-value pairs that holds nested swagger.
 */
export function buildSpec(obj: unknown, spec: any = {}): any {
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

export const swagger = {
  swagger(spec: any): SwaggerObjectBuilder {
    return new SwaggerObjectBuilder(spec);
  },

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

  response(): ResponseObjectBuilder {
    return new ResponseObjectBuilder();
  },

  object(properties?: any): SchemaObjectTypeObjectBuilder {
    const o = new SchemaObjectTypeObjectBuilder();
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

  array(items?: any): SchemaObjectTypeArrayBuilder {
    const a = new SchemaObjectTypeArrayBuilder();
    if (items) {
      a.items(items);
    }
    return a;
  },

  string(): DataTypeBuilder {
    return new DataTypeBuilder("string");
  },

  integer(): DataTypeBuilder {
    return new DataTypeBuilder("integer");
  },

  long(): DataTypeBuilder {
    return new DataTypeBuilder("long");
  },

  float(): DataTypeBuilder {
    return new DataTypeBuilder("float");
  },

  double(): DataTypeBuilder {
    return new DataTypeBuilder("double");
  },

  byte(): DataTypeBuilder {
    return new DataTypeBuilder("byte");
  },

  binary(): DataTypeBuilder {
    return new DataTypeBuilder("binary");
  },

  boolean(): DataTypeBuilder {
    return new DataTypeBuilder("boolean");
  },

  date(): DataTypeBuilder {
    return new DataTypeBuilder("date");
  },

  dateTime(): DataTypeBuilder {
    return new DataTypeBuilder("dateTime");
  },

  password(): DataTypeBuilder {
    return new DataTypeBuilder("password");
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

  public current_resource_being_documented?: Drash.Resource & IResourceWithSwagger;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options?: any) {
    super();
    this.#options = options ?? {};

    // Set the path to the Swagger UI page so that the resource can use it
    serviceGlobals.pathToSwaggerUI = this.#options.path ?? "/swagger-ui";
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC //////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Run this service at startup time (when Drash is being built).
   * @param options
   */
  public runAtStartup(options: Drash.Interfaces.IServiceStartupOptions): void {
    options.server.addResource(SwaggerUIResource);
    this.#documentResources(options.resources);
  }

  /**
   * Create a specification. This call occurs before `runAtStartup()` because it is invoked before the Drash.Server is instantiated..
   *
   * TODO(crookse)
   * - Validate that the spec doesn't already exist
   */
  public createSpec(info: {
    title: string;
    version: string;
  }): void {
    this.#specs.set(
      this.#formatSpecName(info.title, info.version),
      swagger.swagger({
        info,
      }),
    );
  }

  /**
   * Return a properly formed spec name. This spec name will be used in
   * `runAtStartup()` to build specs for resources that have specs.
   */
  public setSpec(
    resource: Drash.Resource & IResourceWithSwagger,
    name: string,
    version: string,
  ): string {
    // Set some properties on the resource object that we can use to document
    // the resource
    resource.operations = {};

    this.current_resource_being_documented = resource;

    return this.#formatSpecName(name, version).toUpperCase();
  }

  public DELETE(
    httpMethodSpec: TResourceHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("delete", httpMethodSpec);
    return handler;
  }

  public GET(
    httpMethodSpec: TResourceHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("get", httpMethodSpec);
    return handler;
  }

  public HEAD(
    httpMethodSpec: TResourceHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("head", httpMethodSpec);
    return handler;
  }

  public OPTIONS(
    httpMethodSpec: TResourceHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("options", httpMethodSpec);
    return handler;
  }

  public PATCH(
    httpMethodSpec: TResourceHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("patch", httpMethodSpec);
    return handler;
  }

  public POST(
    httpMethodSpec: TResourceHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("post", httpMethodSpec);
    return handler;
  }

  public PUT(
    httpMethodSpec: TResourceHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("put", httpMethodSpec);
    return handler;
  }

  #documentResources(resources: Drash.Types.TResourcesAndPatterns): void {
    if (!resources) {
      return;
    }

    const resourcesWithSpecifications =  resources as unknown as TStartupOptionsResources[];

    resourcesWithSpecifications.forEach(
        (
          resourceData: {
            // By now, this service will have modified the resources using this
            // service. So, data members in IResourceWithSwagger will be
            // available.
            resource: typeof Drash.Resource & IResourceWithSwagger;
          },
        ) => {
          // Get the spec
          const resource = resourceData.resource;
          console.log(`resource`, resource);
          const swaggerObjectBuilder = this.#specs.get(resource.spec);
          if (!swaggerObjectBuilder) {
            return;
          }

          // Start building out the spec for this resource
          resource.paths.forEach((path: string) => {
            // Step 1: Create the resource's path's Path Item Object for the
            // current path we are parsing.
            const pathItemObjectBuilder = swagger.pathItem();

            // Step 2: For each HTTP method defined in the reosurce, create its
            // Operation Object
            [
              "GET",
              "POST",
              "PUT",
              "DELETE",
              "OPTIONS",
              "HEAD",
              "PATCH",
            ].forEach((method: string) => {
              // If the HTTP method is not defined in the resource, then there's
              // nothing left to do here. So... get out.
              if (!(method in resource)) {
                return;
              }

              // All resources use capitalized HTTP method names, so the above
              // array uses capitalized HTTP method names. Swagger uses
              // lowercase method names, so we convert the HTTP methods to
              // lowercase.
              const lowerCaseMethod = method.toLowerCase() as TPathItemObjectBuilderHttpMethods;

              // Step 3: Start off with default responses
              pathItemObjectBuilder[lowerCaseMethod](
                swagger.operation().responses({
                  // Have a default OK response
                  200: "OK",
                }),
              );

              // Step 4: Check if the resource has a spec specified. A resource
              // can specify a spec using the HTTP method methods in this class.
              // For example, see the `GET()` method in this class.
              if (
                !resource.operations
                || (!(lowerCaseMethod in resource.operations))
                || !resource.operations[lowerCaseMethod]
              ) {
                return;
              }

              // If we get here, then the resource must have a spec specified
              // for the given HTTP method. So, we create a new variable for
              // some clarity.
              const resourceHttpMethodSpec = resource.operations[lowerCaseMethod]

              // Step 5: Create the Operation Object for the HTTP method we are
              // currently parsing.
              const operationObjectBuilder = swagger.operation();

              // Step 6: Check if the resource has specified parameters for this
              // HTTP method. If so, then add them to the Operation Object.
              if (resourceHttpMethodSpec.parameters) {
                operationObjectBuilder.parameters(
                  resourceHttpMethodSpec.parameters
                );
              }

              // Step 7: Check if the resource has specified responses for this
              // HTTP method. If so, then add them to the Operation Object.
              if (resourceHttpMethodSpec.responses) {
                operationObjectBuilder.responses(
                  resourceHttpMethodSpec.responses
                );
              }

              // Step 8: Pass the Operation Object to the Path Item Object. The
              // Path Item Object will build the Operation Object, so there is
              // no need to call `operationObject.toJson()`.
              pathItemObjectBuilder[lowerCaseMethod](operationObjectBuilder);
            });


            // Step 9 (last step): Add the Path Item Object to the Swagger
            // Object. The Swagger Object will build the Path Item Object, so
            // there is no need to call `pathItemObjectBuilder.toJson()`.
            swaggerObjectBuilder.addPath(path, pathItemObjectBuilder);
          });
        },
      );

      const spec = buildSpec(this.#specs.get("DRASH V1.0")!);
      const stringified = JSON.stringify(spec, null, 2);
      console.log(`stringified`, stringified);

      // Set this spec globally so it can be used by the SwaggerUIResource
      serviceGlobals.specifications.set(
        `swagger-ui-${spec.info.title}-${spec.info.version}`,
        stringified,
      );
  }

  /**
   * Format the spec name.
   *
   * @param title - The title of the spec.
   * @param version - The verison of the spec.
   *
   * @returns A formatted spec name that's uniform across this service.
   */
  #formatSpecName(title: string, version: string): string {
    return `${title} ${version}`.toUpperCase();
  }

  /**
   * Set the current HTTP method to be documented in the current resource. The
   * current resource is the one that called `this.setSpec()` last.
   *
   * Only resources should use the HTTP methods that call this method. Also,
   * this method should only be called if a resource has called
   * `this.setSpec()`. `this.setSpec()` sets the current resource being parsed
   * by this service. If the current resource is not known, then we have no idea
   * how to proceed with creating Swagger specifications for the HTTP method
   * being passed into this method.
   *
   * @param httpMethod - The HTTP method to document. Only HTTP methods defined
   * in Open API Spec v2.0 are allowed.
   * @param httpMethodSpec - The parameters and responses used to create the
   * Operation Object for the HTTP method.
   */
  #setHttpMethodToBeDocumented(
    httpMethod: string,
    httpMethodSpec: TResourceHttpMethodSpec
  ): void {
    if (!this.current_resource_being_documented) {
      throw new Error(`Resource forgot to call oas.setSpec()`);
    }

    if (!this.current_resource_being_documented.operations) {
      throw new Error(`Field 'operations' not found in resource.`);
    }

    this.current_resource_being_documented.operations[httpMethod] = httpMethodSpec;
  }
}

/**
 * Is the object in question of the `IBuilder` interface?
 * @param obj The object in question.
 * @returns True if yes, false if no.
 */
function isBuilder(obj: unknown): obj is IBuilder {
  return !!obj && typeof obj === "object" && "toJson" in obj;
}