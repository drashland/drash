import type { Drash } from "../deps.ts";

interface IFile {
  source: string;
  target: string;
}

interface IOptions {
  files: IFile[];
}

interface ICompiledFile {
  filename: string;
  contents: string;
}

export function ServeTypesScript(options: IOptions) {

  if (!options.files) {
    throw new Error(
      "ServeTypesScript requires an array of files to compile.",
    );
  }

  const compiledFiles = new Map<string, ICompiledFile>();

  /**
   * The method to execute during compile time.
   */
  async function compileTimeMethod(): Promise<void> {
    for (const index in options.files) {
      const file = options.files[index];

      try {
        const [diagnostics, emitMap] = await Deno.compile(
          file.source,
        );
        for (const filename in emitMap) {
          // Exclude source maps from the during compilation
          if (filename.includes(".map")) {
            continue;
          }
          compiledFiles.set(
            filename.replace(".js", ".ts"),
            {
              filename: filename,
              contents: emitMap[filename].replace(/\/\/\# sourceMapping.+/, ""),
            },
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
  async function runtimeMethod(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): Promise<Drash.Http.Response | boolean> {
    if (!request.url.includes(".ts")) {
      return false;
    }

    response.headers.set("Content-Type", "text/javascript");

    const target = request.url.split("?")[0];
    const file = compiledFiles.get(target);
    if (file) {
      response.body = file.contents;
    }

    return response;
  }

  return {
    runtime_method: runtimeMethod,
    compile_time_method: compileTimeMethod,
  };
}
