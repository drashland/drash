import { Interfaces, Resource, Service } from "../../../mod.ts";
import { walkSync } from "./deps.ts";

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
    for (const basePath of this.#options.paths_to_resources) {
      for (const entry of walkSync(basePath)) {
        if (!entry.isFile) {
          continue;
        }

        const fileAsModule = await import(
          await Deno.realPath("./" + entry.path)
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
            if (!propertyNames.includes("drash_resource")) {
              continue;
            }

            options.server.addResource(typeSafeExportedMember);
          } catch (_error) {
            // If `obj` cannot be instantiated, then skip it
          }
        }
      }
    }
  }
}
