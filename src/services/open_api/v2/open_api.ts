import * as Drash from "../../../../mod.ts";
import { SwaggerUIResource } from './resources/swagger_ui_resource.ts';
import { PrimitiveDataTypeBuilder } from './builders/string_builder.ts';
import { SchemaObjectBuilder } from './builders/schema_object_builder.ts';

export let pathToSwaggerUI: string;
export let specs = new Map<string, string>();
export function getSpecURLS(): string {
  const urls: {
    url: string;
    name: string;
  }[] = [];
  specs.forEach((spec: string) => {
    const json = JSON.parse(spec) as any
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
  #specs: any = {};
  // #options: OpenAPIV2ServiceOptions;

  public object(properties?: any): SchemaObjectBuilder {
    const o = new SchemaObjectBuilder("object");

    if (properties) {
      o.properties(properties);
    }

    return o;
  }

  public array(items?: any): SchemaObjectBuilder {
    const a = new SchemaObjectBuilder("array");

    if (items) {
      a.items(items);
    }

    return a;
  }

  public string(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("string");
  }

  public integer(): PrimitiveDataTypeBuilder {
    return new PrimitiveDataTypeBuilder("integer");
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // constructor(options?: OpenAPIServiceOptions) {
  //   super();
  //   this.#options = options ?? {};

  //   // Set the path to the Swagger UI page so that the resource can use it
  //   pathToSwaggerUI = this.#options.path ?? "/swagger-ui";
  // }

  // public post(
  //   operation: OperationObjectBuilder,
  //   handler: Drash.Types.THttpMethodHandler,
  // ): Drash.Types.THttpMethodHandler {
  //   return this.#pathItemObject(
  //     "POST",
  //     operation,
  //     handler,
  //   );
  // }

  // public get(
  //   operation: OperationObjectBuilder,
  //   handler: Drash.Types.THttpMethodHandler,
  // ): Drash.Types.THttpMethodHandler {
  //   return this.#pathItemObject(
  //     "GET",
  //     operation,
  //     handler,
  //   );
  // }

  // #pathItemObject(
  //   method: Drash.Types.THttpMethod,
  //   operation: OperationObjectBuilder,
  //   handler: Drash.Types.THttpMethodHandler,
  // ): Drash.Types.THttpMethodHandler {
  //   if (!this.#current_resource) {
  //     throw new Error(
  //       `OpenAPIService.setSpec() was not called on a resource.\n` +
  //         `OpenaAPIService.setSpec() must be called before using OpenAPIService.{httpMethod}().`,
  //     );
  //   }

  //   console.log("CREATING PATH ITEM OBJECT");

  //   try {
  //     this.#current_resource.oas_operations[method] = operation.toJson();
  //   } catch (error) {
  //     let errorMessage =
  //       `OpenAPI Spec for \`${this.#current_resource.constructor.name}\` could not be built.\n`;
  //     errorMessage += `${error.message}`;
  //     console.log(errorMessage);
  //     Deno.exit(1);
  //   }

  //   return handler;
  // }

  // //////////////////////////////////////////////////////////////////////////////
  // // FILE MARKER - SPEC CREATION ///////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new app to be spec'd with OpenAPI documentation.
   */
  // public createSpec(info: any): SpecBuilder {
  //   const key = info.title + info.version;

  //   if (this.#specs.has(key)) {
  //     throw new Error(
  //       `Spec for "${info.title} ${info.version}" already exists.`,
  //     );
  //   }

  //   const builder = new SpecBuilder(info);
  //   this.#specs.set(
  //     key,
  //     builder,
  //   );
  //   return builder;
  // }

  // public setSpec(
  //   resource: Drash.Resource,
  //   apiTitle: string,
  //   apiVersion: string,
  // ): SpecBuilder {
  //   console.log("SETTING SPEC");
  //   if (!this.#specs.has(apiTitle + apiVersion)) {
  //     throw new Error(
  //       `Spec for "${apiTitle} ${apiVersion}" does not exist.\n` +
  //         `To create one, use \`oas.addSpecV2({ title, version })\`.`,
  //     );
  //   }

  //   const builder = this.#specs.get(apiTitle + apiVersion)!;
  //   this.#current_resource = resource as any;
  //   this.#current_resource.oas_operations = {};

  //   return builder;
  // }

  // public getSpec(
  //   apiTitle: string,
  //   apiVersion: string,
  // ): SpecBuilder {
  //   if (!this.#specs.has(apiTitle + apiVersion)) {
  //     throw new Error(
  //       `Spec for "${apiTitle} ${apiVersion}" does not exist.\n` +
  //         `To create one, use \`oas.addSpecV2({ title, version })\`.`,
  //     );
  //   }

  //   return this.#specs.get(apiTitle + apiVersion)!;
  // }

  // //////////////////////////////////////////////////////////////////////////////
  // // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////

  // runAtStartup(options: {
  //   server: Drash.Server,
  //   resources: Drash.Types.TResourcesAndPatterns,
  // }): void {
  //   server.addResource(SwaggerUIResource);
  // }
}
