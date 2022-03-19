import * as Builders from "./builders.ts";
import * as Drash from "../../../../mod.ts";
import * as Interfaces from "./interfaces.ts";
import { Resource } from "./resources/resource.ts";
import { SwaggerObjectBuilder } from "./builders/swagger_object_builder.ts";
import { SwaggerUIResource } from "./resources/swagger_ui_resource.ts";
import { PathItemObjectBuilderHttpMethods } from "./types.ts";
import { buildSpec } from "./builders/spec_builder.ts";

export { Builders, Resource };

export const serviceGlobals = {
  path_to_swagger_ui: "/swagger-ui",
  specifications: new Map<string, string>(),
  specification_urls: JSON.stringify([]),
};

export class OpenAPIService extends Drash.Service {
  #specs: Map<string, {
    meta?: {
      path?: string;
    };
    swagger_object_builder: SwaggerObjectBuilder;
  }> = new Map();
  #options: Interfaces.IServiceOptions;
  #default_spec!: string;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options: Interfaces.IServiceOptions) {
    super();
    this.#options = options ?? {};
    this.#createDefaultSpec();

    // Set the path to the Swagger UI page so that the resource can use it
    serviceGlobals.path_to_swagger_ui = this.#options.path_to_swagger_ui ??
      "/swagger-ui";
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC //////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Run this service at startup time (when Drash is being built).
   * @param options
   */
  public runAtStartup(options: Drash.Interfaces.IServiceStartupOptions): void {
    // Document all resources registered in the server
    this.#documentResources(options.resources);

    // Build all specs
    this.#buildSpecs();

    // Add the Swagger UI resource. We do this after documenting because we do not want to include this resource in the documenting process.
    options.server.addResource(SwaggerUIResource);

    // After documenting the resources, set the specification URLs for each specification defined by the user.
    this.#createSpecUrls();
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
  }, path?: string): void {
    this.#specs.set(
      formatSpecName(info.title, info.version),
      {
        meta: {
          path,
        },
        swagger_object_builder: Builders.swagger({
          info,
        }),
      },
    );
  }

  /**
   * Build all Open API specifications.
   */
  #buildSpecs(): void {
    this.#specs.forEach(
      (
        spec: {
          meta?: { path?: string };
          swagger_object_builder: SwaggerObjectBuilder;
        },
      ) => {
        const builtSpec = buildSpec(spec.swagger_object_builder);
        const specInJsonStringFormat = JSON.stringify(builtSpec, null, 2);
        let specName =
          `swagger-ui-${builtSpec.info.title}-${builtSpec.info.version}`;
        specName = specName.replace(/\s/g, "-").toLowerCase();
        console.log(specName);
        serviceGlobals.specifications.set(
          specName,
          specInJsonStringFormat,
        );
      },
    );
  }

  /**
   * Create the URLs that map to the Open API specifications.
   */
  #createSpecUrls(): void {
    const urls: {
      url: string;
      name: string;
    }[] = [];

    serviceGlobals.specifications.forEach((spec: string) => {
      const json = JSON.parse(spec) as any;
      let url = `/swagger-ui-${json.info.title}-${json.info.version}.json`;
      url = url.replace(/\s/g, "-").toLowerCase();
      urls.push({
        name: `${json.info.title} ${json.info.version}`,
        url,
      });
    });
    serviceGlobals.specification_urls = JSON.stringify(urls);
  }

  /**
   * Document all resources registered in the `Drash.Server#resources` config.
   * @param resources
   * @returns
   */
  #documentResources(resources: Drash.Types.TResourcesAndPatterns): void {
    if (!resources) {
      return;
    }

    (resources as unknown as { resource: Interfaces.IResource }[]).forEach(
      (
        resourceData: {
          resource: Interfaces.IResource;
        },
      ) => {
        // Get the spec
        const resource = resourceData.resource;
        console.log(`resource`, resource);
        let swaggerObjectBuilder: SwaggerObjectBuilder | undefined;

        if (resource.spec) {
          swaggerObjectBuilder = this.#specs.get(resource.spec)
            ?.swagger_object_builder;
        }

        if (!swaggerObjectBuilder) {
          swaggerObjectBuilder = this.#specs.get(this.#default_spec)
            ?.swagger_object_builder;
        }

        if (!swaggerObjectBuilder) {
          throw new Error(`Open API Specification could not be retrieved.`);
        }

        // Start building out the spec for this resource
        resource.paths.forEach((path: string) => {
          // Step 1: Create the resource's path's Path Item Object for the
          // current path we are parsing.
          const pathItemObjectBuilder = Builders.pathItem();

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
            const lowerCaseMethod = method
              .toLowerCase() as PathItemObjectBuilderHttpMethods;

            // Step 3: Start off with default responses
            pathItemObjectBuilder[lowerCaseMethod](
              Builders.operation().responses({
                // Have a default OK response
                200: "OK",
              }),
            );

            // Step 4: Check if the resource has a spec specified. A resource
            // can specify a spec using the HTTP method methods in this class.
            // For example, see the `GET()` method in this class.
            if (!resource.operations) {
              console.log(resource.constructor.name, "No operations.");
              return;
            }

            if ((!(lowerCaseMethod in resource.operations))) {
              console.log(
                resource.constructor.name,
                "No method in operations.",
              );
              return;
            }

            // If we get here, then the resource must have a spec specified
            // for the given HTTP method. So, we create a new variable for
            // some clarity.
            const resourceHttpMethodSpec = resource.operations[lowerCaseMethod];

            // Step 5: Create the Operation Object for the HTTP method we are
            // currently parsing.
            const operationObjectBuilder = Builders.operation();

            // Step 6: Check if the resource has specified parameters for this
            // HTTP method. If so, then add them to the Operation Object.
            if (resourceHttpMethodSpec.parameters) {
              operationObjectBuilder.parameters(
                resourceHttpMethodSpec.parameters,
              );
            }

            // Step 7: Check if the resource has specified responses for this
            // HTTP method. If so, then add them to the Operation Object.
            if (resourceHttpMethodSpec.responses) {
              operationObjectBuilder.responses(
                resourceHttpMethodSpec.responses,
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
          swaggerObjectBuilder!.addPath(path, pathItemObjectBuilder);
        });
      },
    );
  }

  /**
   * Create the default spec. Any resource that does not specify which spec it should be defined in will end up in this default spec.
   */
  #createDefaultSpec(): void {
    this.createSpec({
      title: this.#options.swagger.info.title,
      version: this.#options.swagger.info.version,
    });
    this.#default_spec = formatSpecName(
      this.#options.swagger.info.title,
      this.#options.swagger.info.version,
    );
  }
}

/**
 * Format the spec name.
 *
 * @param title - The title of the spec.
 * @param version - The verison of the spec.
 *
 * @returns A formatted spec name that's uniform across this service.
 */
export function formatSpecName(title: string, version: string): string {
  return `${title} ${version}`.toUpperCase();
}
