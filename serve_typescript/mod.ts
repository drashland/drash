import type { Drash } from "../deps.ts";

interface IFile {
  source: string;
  target: string;
}

interface IOptions {
  files: IFile[];
}

export function ServeTypeScript(options: IOptions) {
  if (options.files.length <= 0) {
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
        const [diagnostics, outputString]: [
          undefined | Deno.Diagnostic[],
          string,
        ] = await Deno.bundle(
          file.source,
        );

        // Check if there were errors when bundling the clients code
        if (diagnostics && diagnostics.length) {
          const diagnostic = diagnostics[0]; // we only really care about throwing the first error
          const filename = diagnostic.fileName;
          const start = diagnostic.start;
          if (filename && start) {
            const cwd = Deno.cwd();
            console.log('cwd: ' + cwd)
            const separator = Deno.build.os === "windows" ? "\\" : "/"
            console.log('separator: ' + separator)
            const cwdSplit = cwd.split(separator);
            console.log('cwd split: ' + cwdSplit)
            const rootDir = cwdSplit[cwdSplit.length - 1];
            console.log('root dir: ' + rootDir)
            const filenameSplit = filename.split(rootDir);
            console.log('filename split: ' + filenameSplit)
            const pathToBrokenFile = "." +
              filenameSplit[filenameSplit.length - 1]; // a shorter, cleaner display, eg "./server_typescript/..." instead of "file:///Users/..."
            console.log('path  to broken file: ' + pathToBrokenFile)
            throw new Error(
              `User error. ${pathToBrokenFile}:${start.line}:${start.character} - ${diagnostic.messageText}`,
            );
          } else {
            throw new Error(`User error. ${diagnostic.messageText}`);
          }
        }

        // Store the compiled out in the
        // `compiledFiles` variable so that we can check it later for files
        // when clients make requests.
        compiledFiles.set(
          file.target,
          outputString.replace(/\/\/\# sourceMapping.+/, ""), // contents
        );
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }

  /**
   * The method to execute during runtime.
   *
   * @param request - The request object.
   * @param response - The response object.
   */
  function run(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): void {
    if (!request.url.includes(".ts")) {
      return;
    }

    response.headers.set("Content-Type", "text/javascript");

    const filepath = request.url.split("?")[0];
    const contents = compiledFiles.get(filepath);

    if (contents) {
      response.body = contents;
    }
  }

  return {
    compile,
    run,
  };
}
