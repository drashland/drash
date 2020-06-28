import members from "../../members.ts";
import { Rhum } from "../../test_deps.ts";

function getExpected() {
  if (Deno.build.os == "windows") {
    return "<body>      <h1>Hello Drash</h1>  </body>";
  }
  return "<body>     <h1>Hello Drash</h1> </body>";
}

Rhum.testPlan("view_resource_test.ts", () => {
  Rhum.testSuite("/view", () => {
    Rhum.testCase("serves basic HTML", async () => {
      const response = await fetch(
        "http://localhost:3001/view?data=false&file=/index.html",
        {
          method: "GET",
        },
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        getExpected(),
      );
    });
  });
});

Rhum.run();
