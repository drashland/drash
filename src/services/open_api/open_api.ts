import { Drash, SpecTypes } from "./deps.ts";
import { SwaggerUIResource } from "./swagger_ui_resource.ts";
import {
  Builder as OpenAPISpecV2Builder,
  OpenAPIResource,
} from "./builders/open_api_spec_v2/builder.ts";
export { SwaggerUIResource };

import * as OpenAPISpecV2Types from "./builders/open_api_spec_v2/types.ts";

type ResourcesAndPatterns = Drash.Types.TResourcesAndPatterns;
type HttpMethod = Drash.Types.THttpMethod;
const HttpMethodArray = Drash.Types.THttpMethodArray;

export let pathToSwaggerUI: string;
export let specs = new Map<string, string>();

export interface OpenAPIServiceOptions {
  /** Path to the Swagger UI page. Defaults to "/swagger-ui". */
  path?: string;
  spec?: string;
}

export class OpenAPIService extends Drash.Service {
  #options: OpenAPIServiceOptions;

  #specs_v2 = new Map<string, OpenAPISpecV2Builder>();

  #models = new Map<string, unknown>();

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options?: OpenAPIServiceOptions) {
    super();
    this.#options = options ?? {};

    // Set the path to the Swagger UI page so that the resource can use it
    pathToSwaggerUI = this.#options.path ?? "/swagger-ui";
  }

  /**
   * Create a new app to be spec'd with OpenAPI documentation.
   */
  public addSpecV2(info: SpecTypes.InfoObject): OpenAPISpecV2Builder {
    const builder = new OpenAPISpecV2Builder(info);
    this.#specs_v2.set(
      info.title + info.version,
      builder,
    );
    return builder;
  }

  public setSpecV2(
    resource: Drash.Resource,
    apiTitle: string,
    apiVersion: string,
  ): OpenAPISpecV2Builder {
    if (!this.#specs_v2.has(apiTitle + apiVersion)) {
      throw new Error(
        `Spec for "${apiTitle} ${apiVersion}" does not exist.\n` +
          `To create one, use \`oas.addSpecV2({ title, version })\`.`,
      );
    }

    const builder = this.#specs_v2.get(apiTitle + apiVersion)!;
    builder.setCurrentResource(resource);
    return builder;
  }

  public getSpecV2(
    apiTitle: string,
    apiVersion: string,
  ): OpenAPISpecV2Builder {
    if (!this.#specs_v2.has(apiTitle + apiVersion)) {
      throw new Error(
        `Spec for "${apiTitle} ${apiVersion}" does not exist.\n` +
          `To create one, use \`oas.addSpecV2({ title, version })\`.`,
      );
    }

    return this.#specs_v2.get(apiTitle + apiVersion)!;
  }

  /**
   * Get an OpenAPI Spec 3.0 builder.
   */
  public spec3(): void {
    // Not implemented yet.
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  runAtStartup(
    server: Drash.Server,
    resources: Drash.Types.TResourcesAndPatterns,
  ): void {
    console.log("Building spec");
    this.addHostToAllSpecs(server);
    this.addPathObjectToAllResources(resources);
    this.buildSpecs();

    // This comes after `buildSpec()` to prevent the OpenAPI spec from having the Swagger endpoint
    server.addResource(SwaggerUIResource);
  }

  buildSpecs(): void {
    this.#specs_v2.forEach((spec: OpenAPISpecV2Builder) => {
      // By this time, the `info` object should have been created
      const info = spec.getSpec().info!;

      const key = "swagger-ui-" + info.title + "-" + info.version;
      specs.set(key, spec.toJson());

      console.log(spec.toJson());
    });
  }

  addHostToAllSpecs(server: Drash.Server): void {
    this.#specs_v2.forEach((spec: OpenAPISpecV2Builder) => {
      spec.host(server.address);
    });
  }

  addPathObject(resource: OpenAPIResource, path: string): void {
    resource.spec.pathsObject(path);
  }

  addPathObjectToAllResources(
    resources: Drash.Types.TResourcesAndPatterns,
  ): void {
    for (const { resource } of resources.values()) {
      // By this time, the resource should have all members from the `OpenAPIResource` type
      const oasResource = resource as OpenAPIResource;
      // ... however, let's check before continuing.
      if (!oasResource.spec) {
        continue;
      }

      oasResource.paths.forEach((path: string) => {
        this.addPathObject(oasResource, path);

        // For each HTTP method, check if it exists in the resource. If it does, try to document it.
        HttpMethodArray.forEach((method: string) => {
          if (method in oasResource) {
            const { spec } = oasResource;

            // If the method is not documented, then define some basic
            // documentation so it is included in the spec
            if (!(method in oasResource.oas_operations)) {
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
                [], // No params... hopefully this is correct.
              );

              return;
            }

            spec.pathItemObject(
              path,
              method,
              // We know the method exists by this time since we check for it in the `if` block above
              oasResource.oas_operations[method as Drash.Types.THttpMethod]!,
              oasResource.oas_operations[method as Drash.Types.THttpMethod]!.parameters ?? [], // TODO(crookse) Need to implement this.
            );
          }
        });
      });

      oasResource.spec.resetCurrentFields();
    }
  }
}
