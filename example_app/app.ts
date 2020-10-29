import { Drash } from "../mod.ts";

class ClientSideTypeScript {
  protected files: any;
  constructor(files: any) {
    this.files = files;
  }
  protected async run() {
    const file = this.files[0];
    const [diagnostics, emitMap] = await Deno.compile(
      file.source,
    );
    const target = "file://" + this.files[0].source.replace(".ts", ".js");
    const data = {
      uri:  this.files[0].uri.replace(".js", ".ts"),
      output: emitMap[target].replace(/\/\/\# sourceMapping.+/, "")
    };
    return data;
  }
}

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];

  public GET() {
    this.response.body = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Drash</title>
      </head>
      <body>
        <script src="/ts/a_ts_file.ts"></script>
      </body>
    </html>`;

    return this.response;
  }
}

const server = new Drash.Http.Server({
  preprocessors: [
    {
      preprocessor: ClientSideTypeScript,
      data: {
        files: [
          {
            source: Deno.realPathSync(".") + "/example_app/ts/a_ts_file.ts",
            uri: "/ts/a_ts_file.js"
          }
        ]
      }
    }
  ],
  response_output: "text/html",
  resources: [HomeResource],
  directory: Deno.realPathSync("."),
  static_paths: ["/ts"],
});

server.run({
  hostname: "localhost",
  port: 1447,
});

console.log("App started");

