import * as Drash from "../../../../mod.ts";
import * as Types from "./types.ts";
import { SwaggerUIResource } from "./resources/swagger_ui_resource.ts";
import { SpecBuilder } from "./builders/spec_builder.ts";
import { SchemaObjectBuilder } from "./builders/schema_object_builder.ts";
import { ItemsObjectBuilder } from "./builders/items_object_builder.ts";
import { OperationObjectBuilder } from "./builders/operation_object_builder.ts";
import { ParameterObjectBuilders } from "./builders/parameter_object_builders.ts";
import { PrimitiveTypeStringBuilder } from "./builders/primitive_type_string_builder.ts";

export let pathToSwaggerUI: string;
export let specs = new Map<string, string>();
export function getSpecURLS(): string {
  const urls: {
    url: string;
    name: string;
  }[] = [];
  specs.forEach((spec: string) => {
    const json = JSON.parse(spec) as Types.OpenAPISpecV2;
    urls.push({
      name: `${json.info.title} ${json.info.version}`,
      url: `/swagger-ui-${json.info.title}-${json.info.version}.json`,
    });
  });
  return JSON.stringify(urls);
}

export interface OpenAPIServiceOptions {
  /** Path to the Swagger UI page. Defaults to "/swagger-ui". */
  path?: string;
  spec?: string;
}

export class OpenAPIService extends Drash.Service {
  #options: OpenAPIServiceOptions;

  #specs = new Map<string, SpecBuilder>();
  #current_resource?: Types.OpenAPIResource;

  public operationObject(): OperationObjectBuilder {
    return new OperationObjectBuilder();
  }

  public referenceObject(ref: string): Types.ReferenceObject {
    return {
      $ref: `#/definitions/${ref}`,
    };
  }

  // public array(): PrimitiveArrayBuilder {
  //   return new PrimitiveArrayBuilder();
  // }

  public string(): PrimitiveTypeStringBuilder {
    return new PrimitiveTypeStringBuilder();
  }

  public parameterObject(): ParameterObjectBuilders {
    return new ParameterObjectBuilders();
  }

  public schemaObject(): SchemaObjectBuilder {
    return new SchemaObjectBuilder();
  }

  public itemsObject(): ItemsObjectBuilder {
    return new ItemsObjectBuilder();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options?: OpenAPIServiceOptions) {
    super();
    this.#options = options ?? {};

    // Set the path to the Swagger UI page so that the resource can use it
    pathToSwaggerUI = this.#options.path ?? "/swagger-ui";
  }

  public post(
    operation: OperationObjectBuilder,
    handler: Drash.Types.THttpMethodHandler,
  ): Drash.Types.THttpMethodHandler {
    return this.#pathItemObject(
      "POST",
      operation,
      handler,
    );
  }

  public get(
    operation: OperationObjectBuilder,
    handler: Drash.Types.THttpMethodHandler,
  ): Drash.Types.THttpMethodHandler {
    return this.#pathItemObject(
      "GET",
      operation,
      handler,
    );
  }

  #pathItemObject(
    method: Drash.Types.THttpMethod,
    operation: OperationObjectBuilder,
    handler: Drash.Types.THttpMethodHandler,
  ): Drash.Types.THttpMethodHandler {
    if (!this.#current_resource) {
      throw new Error(
        `OpenAPIService.setSpec() was not called on a resource.\n` +
          `OpenaAPIService.setSpec() must be called before using OpenAPIService.{httpMethod}().`,
      );
    }

    console.log("CREATING PATH ITEM OBJECT");

    try {
      this.#current_resource.oas_operations[method] = operation.toJson();
    } catch (error) {
      let errorMessage =
        `OpenAPI Spec for \`${this.#current_resource.constructor.name}\` could not be built.\n`;
      errorMessage += `${error.message}`;
      console.log(errorMessage);
      Deno.exit(1);
    }

    return handler;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - SPEC CREATION ///////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new app to be spec'd with OpenAPI documentation.
   */
  public createSpec(info: Types.InfoObject): SpecBuilder {
    const key = info.title + info.version;

    if (this.#specs.has(key)) {
      throw new Error(
        `Spec for "${info.title} ${info.version}" already exists.`,
      );
    }

    const builder = new SpecBuilder(info);
    this.#specs.set(
      key,
      builder,
    );
    return builder;
  }

  public setSpec(
    resource: Drash.Resource,
    apiTitle: string,
    apiVersion: string,
  ): SpecBuilder {
    console.log("SETTING SPEC");
    if (!this.#specs.has(apiTitle + apiVersion)) {
      throw new Error(
        `Spec for "${apiTitle} ${apiVersion}" does not exist.\n` +
          `To create one, use \`oas.addSpecV2({ title, version })\`.`,
      );
    }

    const builder = this.#specs.get(apiTitle + apiVersion)!;
    this.#current_resource = resource as Types.OpenAPIResource;
    this.#current_resource.oas_operations = {};

    return builder;
  }

  public getSpec(
    apiTitle: string,
    apiVersion: string,
  ): SpecBuilder {
    if (!this.#specs.has(apiTitle + apiVersion)) {
      throw new Error(
        `Spec for "${apiTitle} ${apiVersion}" does not exist.\n` +
          `To create one, use \`oas.addSpecV2({ title, version })\`.`,
      );
    }

    return this.#specs.get(apiTitle + apiVersion)!;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  runAtStartup(
    server: Drash.Server,
    resources: Drash.Types.TResourcesAndPatterns,
  ): void {
    console.log("BUILDING SPEC");
    this.addHostToAllSpecs(server);
    this.addPathObjectToAllResources(resources);
    this.preDocument();

    // This comes after `buildSpec()` to prevent the OpenAPI spec from having the Swagger endpoint
    server.addResource(SwaggerUIResource);
  }

  preDocument(): void {
    this.#specs.forEach((spec: SpecBuilder) => {
      // By this time, the `info` object should have been created
      const info = spec.getSpec().info!;

      const key = "swagger-ui-" + info.title + "-" + info.version;
      specs.set(key, spec.toJson());

      console.log(spec.toJson());
    });
  }

  addHostToAllSpecs(server: Drash.Server): void {
    this.#specs.forEach((spec: SpecBuilder) => {
      spec.host(server.address);
    });
  }

  addPathObject(resource: Types.OpenAPIResource, path: string): void {
    resource.spec.pathsObject(path);
  }

  addPathObjectToAllResources(
    resources: Drash.Types.TResourcesAndPatterns,
  ): void {
    for (const { resource } of resources.values()) {
      // By this time, the resource should have all members from the `OpenAPIResource` type
      const oasResource = resource as Types.OpenAPIResource;
      // ... however, let's check before continuing.
      if (!oasResource.spec) {
        continue;
      }

      oasResource.paths.forEach((path: string) => {
        this.addPathObject(oasResource, path);

        // For each HTTP method, check if it exists in the resource. If it does, try to document it.
        Drash.Types.THttpMethodArray.forEach((method: string) => {
          if (method in oasResource) {
            const { spec } = oasResource;

            // If the method is not documented, then define some basic
            // documentation so it is included in the spec
            if (!(method in oasResource.oas_operations)) {
              console.log(method, `not in`, oasResource);
              spec.pathItemObject(
                path,
                method,
                {
                  description: "", // No description! Womp womp.
                  summary: "", // No summary! Womp womp.
                  responses: {
                    200: { // Default to a 200 response (hopefully a 200 is returned)
                      description: "Successful",
                    },
                  },
                },
              );

              return;
            }

            spec.pathItemObject(
              path,
              method,
              // We know the method exists by this time since we check for it in the `if` block above
              oasResource.oas_operations[method as Drash.Types.THttpMethod]!,
            );
          }
        });
      });

      oasResource.spec.resetCurrentFields();
    }
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
