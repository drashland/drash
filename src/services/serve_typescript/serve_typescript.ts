import { Service, IService, IContext } from "../../../mod.ts"

interface IFile {
  source: string;
  target: string;
}

interface IOptions {
  files: IFile[];
  compilerOptions?: Deno.CompilerOptions;
}

export class ServeTypeScriptService extends Service implements IService {

    #compiledFiles: Map<string, string> = new Map()

    readonly #options: IOptions

    constructor(options: IOptions) {
        super()
        if (options.files.length <= 0) {
            throw new Error(
              "ServeTypeScript requires an array of files to compile.",
            );
          }
          this.#options =options 
    }

    runBeforeResource(context: IContext) {
        if (!context.request.url.includes(".ts")) {
            return;
          }
          context.response.headers.set("Content-Type", "text/javascript");
          const uri = new URL(context.request.url).pathname
          const filepath = uri.split("?")[0];
          const contents = this.#compiledFiles.get(filepath);
          if (contents) {
            context.response.body = contents;
            context.response.send()
          }
    }

    async setUp() {
        for (const index in this.#options.files) {
            const file = this.#options.files[index];
      
            try {
              const { diagnostics, files } = await Deno.emit(
                file.source,
                {
                  compilerOptions: this.#options.compilerOptions ?? {},
                },
              );
              const fileKey = Object.keys(files).find((filename) => {
                return filename.includes(".ts.js.map") === false;
              }) as string;
              const outputString = files[fileKey];
      
              const formattedDiagnostics = Deno.formatDiagnostics(diagnostics);
              if (formattedDiagnostics !== "") {
                throw new Error(formattedDiagnostics);
              }
      
              // Store the compiled out in the
              // `compiledFiles` variable so that we can check it later for files
              // when clients make requests.
              this.#compiledFiles.set(
                file.target,
                outputString.replace(/\/\/\# sourceMapping.+/, ""), // contents
              );
            } catch (error) {
              throw new Error(error.message);
            }
          }
    }
}