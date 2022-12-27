import { Interfaces, Resource, Types } from "../../../mod.deno.ts";
import { join, walkSync } from "./deps.ts";

interface IOptions {
  /**
   * The paths to the resources.
   *
   * @example
   * ```typescript
   * ["./resources/api", "./resources/ssr"]
   * ```
   */
  paths_to_resources: string[];
}

export class ResourceLoaderService implements Interfaces.Service {
  #options: IOptions;

  /**
   * Autoload resources in the provided `options.paths_to_resources` option.
   * @param options - See `IOptions`. More information can be found at https://drash.land/drash.
   *
   * @example
   * ```typescript
   * const resourceLoader = new ResourceLoaderService({
   *   paths_to_resources: [
   *     "./resources/api", // Loads all resources in ./resources/api directory
   *     "./resources/ssr", // Loads all resources in ./resources/ssr directory
   *   ],
   * });
   *
   * const server = new Drash.Server({
   *   protocol: "http",
   *   hostname: "localhost",
   *   port: 1337,
   *   services: [
   *     resourceLoader, // Plug in the service to add the autoloaded resources
   *   ],
   * });
   * ```
   */
  constructor(options: IOptions) {
    this.#options = options;
  }

  public async runAtStartup(
    context: Types.ContextForServicesAtStartup,
  ): Promise<void> {
    for (const basePath of this.#options.paths_to_resources) {
      for (const entry of walkSync(basePath)) {
        if (!entry.isFile) {
          continue;
        }

        const fileAsModule = await import(
          this.#getUrlWithFileScheme(entry.path)
        );

        if (!fileAsModule || typeof fileAsModule !== "object") {
          continue;
        }

        const exportedMemberNames = Object.keys(fileAsModule);

        if (!exportedMemberNames || exportedMemberNames.length <= 0) {
          continue;
        }

        for (const exportedMemberName of exportedMemberNames) {
          const exportedMember = (fileAsModule as { [k: string]: unknown })[
            exportedMemberName as string
          ];

          if (typeof exportedMember !== "function") {
            continue;
          }

          const typeSafeExportedMember =
            exportedMember as unknown as typeof Resource;

          try {
            const obj = new typeSafeExportedMember();
            const propertyNames = Object.getOwnPropertyNames(obj);

            // The paths must always be present
            if (!propertyNames.includes("paths")) {
              continue;
            }

            context.request_handler.addResources([typeSafeExportedMember]);
          } catch (_error) {
            // If `obj` cannot be instantiated, then skip it
          }
        }
      }
    }
  }

  /**
   * In some cases, the file:// scheme may be missing. To make sure it is always
   * present when using dynamic imports, we check if it's missing and add it if
   * so.
   *
   * @param path - The path that may have a missing file:// scheme.
   *
   * @returns The path if file:// exists or a new path with file:// added.
   */
  #getUrlWithFileScheme(path: string): string {
    const scheme = "file://";

    const url = new URL(join(Deno.cwd(), path), scheme + Deno.cwd());

    let urlWithFileScheme = url.href;

    // If the file:// scheme is not included during URL creation, then make sure
    // it is added
    if (!urlWithFileScheme.includes(scheme)) {
      urlWithFileScheme = scheme + urlWithFileScheme;
    }

    return urlWithFileScheme;
  }
}
