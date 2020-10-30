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

export function ServeTs(options: IOptions) {
  if (!options.files) {
    throw new Error(
      "ServeTs middleware requires an array of files to compile.",
    );
  }

  const compiledFiles = new Map<string, ICompiledFile>();

  /**
   * The method to execute during compile time.
   */
  async function compileTimeMethod(): Promise<void> {
    for (const index in options.files) {
      const file = options.files[index];

      const [diagnostics, emitMap] = await Deno.compile(
        file.source,
      );

      if (emitMap) {
        for (const filename in emitMap) {
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

    compiledFiles.forEach((file: ICompiledFile, key: string) => {
      if (response.body === "" && key.includes(request.url)) {
        response.body = file.contents;
      }
    });

    return response;
  }

  return {
    runtime_method: runtimeMethod,
    compile_time_method: compileTimeMethod,
  };
}
