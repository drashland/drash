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

export interface OpenAPIV2ServiceOptions {
  /** Path to the Swagger UI page. Defaults to "/swagger-ui". */
  path?: string;
  spec?: string;
}

export class OpenAPIV2Service extends Drash.Service {
  #options: OpenAPIV2ServiceOptions;

  public string(): StringBuilder {
    return new StringBuilder();
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

  runAtStartup(options: {
    server: Drash.Server,
    resources: Drash.Types.TResourcesAndPatterns,
  }): void {
    server.addResource(SwaggerUIResource);
  }
}
