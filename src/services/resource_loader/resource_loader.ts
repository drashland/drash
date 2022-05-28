import { Interfaces, Resource, Service } from "../../../mod.ts";
import { walk } from "./deps.ts";

interface IOptions {
  paths_to_resources: string[];
}

export class ResourceLoaderService extends Service {
  #options: IOptions;

  constructor(options: IOptions) {
    super();
    this.#options = options;
  }

  public async runAtStartup(
    options: Interfaces.IServiceStartupOptions,
  ): Promise<void> {
    for (const i in this.#options.paths_to_resources) {
      const basePath = this.#options.paths_to_resources[i];

      for await (const entry of walk(basePath)) {
        if (!entry.isFile) {
          continue;
        }

        const fileAsModule = await import(
          await Deno.realPath("./" + entry.path)
        );

        if (!fileAsModule || typeof fileAsModule !== "object") {
          return;
        }

        const exportedMemberNames = Object.keys(fileAsModule);

        if (!exportedMemberNames || exportedMemberNames.length <= 0) {
          return;
        }

        exportedMemberNames.forEach((exportedMemberName: string) => {
          const exportedMember =
            (fileAsModule as { [k: string]: unknown })[exportedMemberName];

          if (typeof exportedMember !== "function") {
            return;
          }

          const typeSafeExportedMember =
            exportedMember as unknown as typeof Resource;

          try {
            const obj = new typeSafeExportedMember();
            const propertyNames = Object.getOwnPropertyNames(obj);
            if (!propertyNames.includes("drash_resource")) {
              return;
            }

            options.server.addResource(typeSafeExportedMember);
          } catch (_error) {
            // If `obj` cannot be instantiated, then skip it
          }
        });
      }
    }
  }
}
