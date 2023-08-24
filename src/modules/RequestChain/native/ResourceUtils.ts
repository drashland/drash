import { IResource } from "../../../core/Interfaces.ts";
import { ResourceClassesArray } from "../../../standard/handlers/AbstractResourceHandler.ts";
import { ConsoleLogger, Level } from "../../../standard/log/ConsoleLogger.ts";

const logger = ConsoleLogger.create("ResourceUtils", Level.Off);

export function buildResourceStore(...resources: ResourceClassesArray): {
  resource: IResource;
  path_patterns: URLPattern[];
} {
  const ret = [];

  for (const ResourceClass of resources) {
    if (Array.isArray(ResourceClass)) {
      buildResourceStore(ResourceClass);
      continue;
    }

    // @ts-ignore
    const pathPatterns: any[] = []; // Should be URLPattern, not any

    const resource = new ResourceClass();
    resource.paths.forEach((path: string) => {
      // Add "{/}?" to match possible trailing slashes too. For example, this
      // means the following paths point to the same resource:
      //
      //   - /coffee
      //   - /coffee/
      //
      // @ts-ignore
      pathPatterns.push(new URLPattern({ pathname: path + "{/}?" }));

      logger.debug(`Added resource/pathname mapping: {}`, {
        name: resource.constructor.name,
        path,
      });
    });

    ret.push({
      resource,
      path_patterns: pathPatterns,
    });
  }

  return ret;
}