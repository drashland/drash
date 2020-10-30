import type { Drash } from "../../deno-drash/mod.ts";

interface IFile {
  source: string;
  target: string;
}

interface IOptions {
  files: IFile[];
}

export function ServeTypeScript(options: IOptions) {
  if (!options.files) {
    throw new Error(
      "ServeTypeScript requires an array of files to compile.",
    );
  }

  /**
   * A variable to store all compiled file data. The key in the map is the
   * filepath and the value is the contents. For example:
   *
   *     ["/ts/my_file.ts", "console.log('hello')"]
   */
  const compiledFiles = new Map<string, string>();

  /**
   * The method to execute during compile time.
   */
  async function compile(): Promise<void> {
    for (const index in options.files) {
      const file = options.files[index];

      try {
        const [diagnostics, emitMap] = await Deno.compile(
          file.source,
        );
        for (const fullFilepath in emitMap) {
          // Exclude source maps during compilation of the `compiledFiles`
          // variable. We don't care about source maps because this middleware
          // sends virtual files that aren't associated with a source map. If a
          // client request a source map through this middleware, it wouldn't
          // work becauset the file does not actually exist on the filesystem.
          if (fullFilepath.includes(".map")) {
            continue;
          }

          // Store the compiled out (excluding the source map link) in the
          // `compiledFiles` variable so that we can check it later for files
          // when clients make requests.
          compiledFiles.set(
            file.target,
            emitMap[fullFilepath].replace(/\/\/\# sourceMapping.+/, ""), // contents
          );
        }
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  }

  /**
   * The method to execute during runtime.
   *
   * @param request - The request object.
   * @param response - The response object.
   *
   * @returns A Drash response or boolean. If a boolean is returned, then true
   * means it processed properly and false means it did not.
   */
  async function run(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): Promise<Drash.Http.Response | boolean> {
    if (!request.url.includes(".ts")) {
      return false;
    }

    response.headers.set("Content-Type", "text/javascript");

    const filepath = request.url.split("?")[0];
    const contents = compiledFiles.get(filepath);
    if (contents) {
      response.body = contents;
    }

    return response;
  }

  return {
    compile,
    run,
  };
}
