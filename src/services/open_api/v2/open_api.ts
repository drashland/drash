import * as Drash from "../../../../mod.ts";
import { SwaggerUIResource } from "./resources/swagger_ui_resource.ts";
import { PrimitiveDataTypeBuilder } from "./builders/primitive_data_type_builder.ts";
import {
  SchemaObjectTypeArrayBuilder,
  SchemaObjectTypeObjectBuilder,
} from "./builders/schema_object_builder.ts";
import { SwaggerObjectBuilder } from "./builders/swagger_object_builder.ts";
import { PathItemObjectBuilder } from "./builders/path_item_object_builder.ts";
import { OperationObjectBuilder } from "./builders/operation_object_builder.ts";
import { ResponseObjectBuilder } from "./builders/response_object_builder.ts";
import {
  ParameterInBodyObjectBuilder,
  ParameterInFormDataObjectBuilder,
  ParameterInHeaderObjectBuilder,
  ParameterInPathObjectBuilder,
  ParameterInQueryObjectBuilder,
} from "./builders/parameter_object_builder.ts";
import { IBuilder } from "./interfaces.ts";

interface IHttpMethodSpec {
  parameters?: IBuilder[],
  responses?: {[statusCode: number]: IBuilder},
}

export type PathItemObjectBuilderHttpMethods =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options"

export let pathToSwaggerUI: string;
export const specs = new Map<string, string>();

interface IResourceWithSwagger extends Drash.Resource {
  /** Example: DRASH V1.0 */
  spec: string;
  operations?: { [method: string]: any };
}

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

export type Builders = {
  array: (properties?: any) => SchemaObjectTypeArrayBuilder;
  binary: () => PrimitiveDataTypeBuilder;
  body: () => ParameterInBodyObjectBuilder;
  boolean: () => PrimitiveDataTypeBuilder;
  byte: () => PrimitiveDataTypeBuilder;
  date: () => PrimitiveDataTypeBuilder;
  dateTime: () => PrimitiveDataTypeBuilder;
  double: () => PrimitiveDataTypeBuilder;
  float: () => PrimitiveDataTypeBuilder;
  formData: () => ParameterInFormDataObjectBuilder;
  header: () => ParameterInHeaderObjectBuilder;
  integer: () => PrimitiveDataTypeBuilder;
  long: () => PrimitiveDataTypeBuilder;
  object: (properties?: any) => SchemaObjectTypeObjectBuilder;
  operation: () => OperationObjectBuilder;
  password: () => PrimitiveDataTypeBuilder;
  path: () => ParameterInPathObjectBuilder;
  pathItem: () => PathItemObjectBuilder;
  query: () => ParameterInQueryObjectBuilder;
  response: () => ResponseObjectBuilder;
  string: () => PrimitiveDataTypeBuilder;
  swagger: (spec: any) => SwaggerObjectBuilder;
};

export const Swagger: Builders = {
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

  public current_resource_being_documented?: Drash.Resource & IResourceWithSwagger;

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
    console.log(`runAtStartup`);
    console.log(`options`, options);
    if (options.server) {
      options.server.addResource(SwaggerUIResource);
    }

    if (options.resources) {
      options.resources.forEach(
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
            const pathItemObjectBuilder = Swagger.pathItem();

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
              const lowerCaseMethod = method.toLowerCase() as PathItemObjectBuilderHttpMethods;

              // Step 3: Start off with default responses
              pathItemObjectBuilder[lowerCaseMethod](
                Swagger.operation().responses({
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
              const operationObjectBuilder = Swagger.operation();

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
      specs.set(
        `swagger-ui-${spec.info.title}-${spec.info.version}`,
        stringified,
      );
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
    this.#specs.set(
      this.#formatSpecName(info.title, info.version),
      Swagger.swagger({
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
    httpMethodSpec: IHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("delete", httpMethodSpec);
    return handler;
  }

  public GET(
    httpMethodSpec: IHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("get", httpMethodSpec);
    return handler;
  }

  public HEAD(
    httpMethodSpec: IHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("head", httpMethodSpec);
    return handler;
  }

  public OPTIONS(
    httpMethodSpec: IHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("options", httpMethodSpec);
    return handler;
  }

  public PATCH(
    httpMethodSpec: IHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("patch", httpMethodSpec);
    return handler;
  }

  public POST(
    httpMethodSpec: IHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("post", httpMethodSpec);
    return handler;
  }

  public PUT(
    httpMethodSpec: IHttpMethodSpec,
    handler: (request: Drash.Request, response: Drash.Response) => void,
  ): (request: Drash.Request, response: Drash.Response) => void {
    this.#setHttpMethodToBeDocumented("put", httpMethodSpec);
    return handler;
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
    httpMethodSpec: IHttpMethodSpec
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

class SpecBuilder {
}
