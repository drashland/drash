import { Rhum } from "../../deps.ts";
import { DrashRequest, DrashResponse } from "../../../mod.ts";
import { ServeTypeScriptService } from "../../../src/services/serve_typescript/serve_typescript.ts";

Rhum.testPlan("ServeTypeScript - mod_test.ts", () => {
  Rhum.testSuite("ServeTypeScript", () => {
    // Rhum.testCase("requires files", () => {
    //   Rhum.asserts.assertThrows(() => {
    //     new ServeTypeScriptService({
    //       files: [],
    //     });
    //   });
    // });
    // Rhum.testCase(
    //   "Throws an error when the users code is invalid when trying to compile",
    //   async () => {
    //     const serveTs = new ServeTypeScriptService({
    //       files: [
    //         {
    //           source: "./data/serve_typescript/invalid_ts.ts",
    //           target: "/assets/compiled.ts",
    //         },
    //       ],
    //     });
    //     let errMsg = "";
    //     try {
    //       await serveTs.setUp();
    //     } catch (err) {
    //       errMsg = err.message;
    //     }
    //     Rhum.asserts.assertEquals(
    //       errMsg.indexOf("Cannot find name 's'.") !== -1,
    //       true,
    //     );
    //   },
    // );
    Rhum.testCase("Compiles TypeScript to JavaScript", async () => {
      const serveTs = new ServeTypeScriptService({
        files: [
          {
            source: "./tests/unit/services/data/serve_typescript/my_ts.ts",
            target: "/assets/compiled.ts",
          },
        ],
        compilerOptions: {
          lib: ["dom", "DOM.Iterable", "esnext"],
        },
      });
      const url = new URL("http://localhost:1234/assets/compiled.ts");
      const request = new Request(url.href);
      const req = new DrashRequest(request, new Map(), url.searchParams);
      let result: Response | null = null;
      const response = new DrashResponse(async (r) => {
        result = await r;
      });
      await serveTs.setUp();
      await serveTs.runBeforeResource({
        request: req,
        response,
      });
      Rhum.asserts.assertEquals(
        result!.headers.get("content-type"),
        "text/javascript",
      );
      Rhum.asserts.assertEquals(
        response!.headers.get("content-type"),
        "text/javascript",
      );
      Rhum.asserts.assertEquals(
        response.body,
        "export function greet(name) {\n" +
          '    return "Hello, " + name;\n' +
          "}\n" +
          "class Employee {\n" +
          "    company_name;\n" +
          "    name;\n" +
          "    constructor(props) {\n" +
          "        this.company_name = props.company_name;\n" +
          "        this.name = props.name;\n" +
          "    }\n" +
          "}\n" +
          "export class User extends Employee {\n" +
          "    constructor(details) {\n" +
          "        super(details);\n" +
          "    }\n" +
          "}\n" +
          "const _something = document.body;\n",
      );
    });
  });
});

Rhum.run();
