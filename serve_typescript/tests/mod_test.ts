import { Drash } from "../../deps.ts";
import { mockRequest, Rhum } from "../../test_deps.ts";
import { ServeTypeScript } from "../mod.ts";

Rhum.testPlan("ServeTypeScript - mod_test.ts", () => {
  Rhum.testSuite("ServeTypeScript", () => {
    Rhum.testCase("requires files", () => {
      Rhum.asserts.assertThrows(() => {
        ServeTypeScript({
          files: [],
        });
      });
    });
    Rhum.testCase(
      "Throws an error when the users code is invalid when trying to compile",
      async () => {
        const drashRequest = new Drash.Http.Request(
          mockRequest("/assets/compiled.ts"),
        );
        const drashResponse = new Drash.Http.Response(drashRequest);
        const serveTs = ServeTypeScript({
          files: [
            {
              source: "./serve_typescript/tests/data/invalid_ts.ts",
              target: "/assets/compiled.ts",
            },
          ],
        });
        let errMsg = "";
        try {
          await serveTs.compile();
        } catch (err) {
          errMsg = err.message;
        }
        Rhum.asserts.assertEquals(
          errMsg,
          "User error. ./serve_typescript/tests/data/invalid_ts.ts:0:27 - Cannot find name 's'.",
        );
      },
    );
    Rhum.testCase("Compiles TypeScript to JavaScript", async () => {
      const drashRequest = new Drash.Http.Request(
        mockRequest("/assets/compiled.ts"),
      );
      const drashResponse = new Drash.Http.Response(drashRequest);
      const serveTs = ServeTypeScript({
        files: [
          {
            source: "./serve_typescript/tests/data/my_ts.ts",
            target: "/assets/compiled.ts",
          },
        ],
      });
      await serveTs.compile();
      await serveTs.run(
        drashRequest,
        drashResponse,
      );
      Rhum.asserts.assertEquals(
        drashResponse.body,
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
          "}\n",
      );
    });
  });
});

Rhum.run();
