const cwd = Deno.realPathSync(".");

/**
 * Creates a map of { option: value }
 * TODO: This needs to be reworked in services/cli
 *
 * @param args - Deno.args
 * @returns options
 */
function getOptionsMap(args: string[]): { [key: string]: string } {
  const optionsMap = args.reduce((acc: any, arg: string) => {
    const [option, value] = arg.split("=");
    if (!value) {
      console.error("Resource requires a path argument");
      Deno.exit(1);
    }
    acc[option] = value;
    return acc;
  }, {});
  return Object.keys(optionsMap).length ? optionsMap : null;
}

/**
 * Resource template.
 *
 * @param resourceName - resouce name of class
 * @returns resource template
 */
function getResourceTemplate(resourceName: string): string {
  return `class ${resourceName} extends Drash.Http.Resource {
  static paths = [];
  public GET() {}
  public POST() {}
  public DELETE() {}
  public PATCH() {}
}`;
} /**
 * Extracts resource name from user provided path.
 *
 * @param path - path to resource file.
 * @returns name of resource class.
 */

function getResourceName(path: string): string {
  const filename = path.split("/").pop()!;
  const [name, ext] = filename.split(".");
  if (!ext || ext !== "ts") {
    console.error("A valid file extension is required: .ts.");
    Deno.exit(1);
  }

  const parts = name.split("_");
  const resourceName = parts.reduce((acc, part) => {
    acc += part.substr(0, 1).toUpperCase() + part.substr(1);
    return acc;
  }, "" as string);
  return resourceName;
}

/**
 * Makes a resource file and writes to path.
 *
 * @param args - command args
 */
export function make(args: string[]): void {
  const options = getOptionsMap(args);
  const path = options["--resource"];
  const resourceName = getResourceName(path);
  const resourceTemplate = getResourceTemplate(resourceName);

  const encodedTemplate = new TextEncoder().encode(resourceTemplate);
  const absolutePath = cwd + path;

  Deno.writeFileSync(cwd + path, encodedTemplate);
  console.log(
    `Success! ${resourceName} resource has been created in ${absolutePath}`,
  );
}
