import {
  ComputedTypes,
  Drash,
  SpecTypes,
} from "./deps.ts";
import { SwaggerUIResource } from "./swagger_ui_resource.ts";
import {
  Builder as OpenAPISpecV2Builder,
} from "./builders/open_api_spec_v2/builder.ts";

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

export type SpecResource = {
  specs?: {
    [key in Drash.Types.THttpMethod]?: {
      description?: string;
      parameters?: SpecTypes.ParameterObject[];
      responses: SpecTypes.ResponsesObject;
    }
  }
} & Drash.Resource;

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
    resources: ResourcesAndPatterns
  ): void {
    console.log("Building spec");
    this.buildSpec(server, resources);

    // This comes after `buildSpec()` to prevent the OpenAPI spec from having the Swagger endpoint
    server.addResource(SwaggerUIResource);
  }

  buildSpec(
    server: Drash.Server,
    resources: ResourcesAndPatterns
  ): void {
    this.#spec_2_builder.host(server.address);

    for (const { resource, patterns } of resources.values()) {
      const specResource: SpecResource = resource;

      specResource.paths.forEach((path: string) => {
        this.#spec_2_builder.pathsObject(path);


        HttpMethodArray.forEach((method: string) => {
          if (method in specResource) {
            if (specResource.specs) {
              const { specs } = specResource;

              // If the method is not documented, then define some basic
              // documentation so it is included in the spec
              if (!(method in specs)) {
                this.#spec_2_builder.pathItemObject(
                  path,
                  method.toLowerCase(),
                  "",
                  {
                    200: {
                      description: "Successful",
                    },
                  },
                  [],
                );
                return;
              }

              const methodSpecs = specs[method as Drash.Types.THttpMethod]!;

              this.#spec_2_builder.pathItemObject(
                path,
                method.toLowerCase(), // Spec requires method be lowercased
                methodSpecs.description ?? "",
                methodSpecs.responses,
                methodSpecs.parameters ?? [],
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
