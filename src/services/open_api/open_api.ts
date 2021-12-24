import {
  ComputedTypes,
  Drash,
  SpecTypes,
} from "./deps.ts";
import { SwaggerUIResource } from "./swagger_ui_resource.ts";
import {
  Builder as OpenAPISpecV2Builder,
  ResourceWithSpecs
} from "./builders/open_api_spec_v2/builder.ts";
export { SwaggerUIResource };

import * as OpenAPISpecV2Types from "./builders/open_api_spec_v2/types.ts";

type ResourcesAndPatterns = Drash.Types.TResourcesAndPatterns;
type HttpMethod = Drash.Types.THttpMethod;
const HttpMethodArray = Drash.Types.THttpMethodArray;

export let pathToSwaggerUI: string;
export let openApiSpec: string;

export interface OpenAPIServiceOptions {
  /** Path to the Swagger UI page. Defaults to "/swagger-ui". */
  path?: string;
  spec?: string;
}

export class OpenAPIService extends Drash.Service {
  #options: OpenAPIServiceOptions;

  #models = new Map<string, unknown>();

  #spec_2_builder = new OpenAPISpecV2Builder();

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options: OpenAPIServiceOptions) {
    super();
    this.#options = options;

    // Set the path to the Swagger UI page so that the resource can use it
    pathToSwaggerUI = this.#options.path ?? "/swagger-ui";
  }

  public spec2(): OpenAPISpecV2Builder {
    return this.#spec_2_builder;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  runAtStartup(
    server: Drash.Server,
    resources: Drash.Types.TResourcesAndPatterns,
  ): void {
    console.log("Building spec");
    this.buildSpec(server, resources);

    // This comes after `buildSpec()` to prevent the OpenAPI spec from having the Swagger endpoint
    server.addResource(SwaggerUIResource);
  }

  buildSpec(
    server: Drash.Server,
    resources: Drash.Types.TResourcesAndPatterns,
  ): void {
    this.#spec_2_builder.host(server.address);

    for (const { resource, patterns } of resources.values()) {
      const specResource: ResourceWithSpecs = resource;

      specResource.paths.forEach((path: string) => {
        this.#spec_2_builder.pathsObject(path);


        HttpMethodArray.forEach((method: string) => {
          if (method in specResource) {
            if (specResource.swagger) {
              const { swagger } = specResource;

              if (!swagger.operations) {
                return;
              }

              // If the method is not documented, then define some basic
              // documentation so it is included in the spec
              if (!(method in swagger.operations)) {
                this.#spec_2_builder.pathItemObject(
                  path,
                  method.toLowerCase(),
                  "", // No summary womp womp
                  "", // No description womp womp
                  {
                    200: { // Default to a 200 response (hopefully a 200 is returned)
                      description: "Successful",
                    },
                  },
                  [], // No params... hopefully this is correct.
                );
                return;
              }

              const operation = swagger.operations[method as Drash.Types.THttpMethod]!;

              this.#spec_2_builder.pathItemObject(
                path,
                method.toLowerCase(), // Spec requires method be lowercased
                operation.summary ?? "",
                operation.description ?? "",
                operation.responses,
                operation.parameters ?? [],
              );
            }
          }
        });
      });
    }

    openApiSpec = this.#spec_2_builder.build();
    console.log(openApiSpec);
  }
}
