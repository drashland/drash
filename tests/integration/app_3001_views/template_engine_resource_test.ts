import members from "../../members.ts";
import { Rhum } from "../../deps.ts";

function getExpected() {
  if (Deno.build.os == "windows") {
    return `<!DOCTYPE html>  <html class=\"h-full w-full\">    <head>      <meta charset=\"utf-8\"/>      <meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, user-scalable=no\"/>      <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css\">      <title>Skills</title>    </head>    <body>          <div style=\"max-width: 640px; margin: 50px auto;\">    <h1 class=\"text-5xl\">Steve Rogers</h1>    <h2 class=\"text-4xl\">Skills</h2>    <ul>        <li>Shield Throwing</li>        <li>Bashing</li>        <li>Hammer Holding</li>      </ul>      <ul>    <li>Item 1</li>    <li>Item 2</li>    <li>Footer Item 3</li>  </ul>    Footer    </div>      </body>  </html>  `;
  }
  return `<!DOCTYPE html> <html class=\"h-full w-full\">   <head>     <meta charset=\"utf-8\"/>     <meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, user-scalable=no\"/>     <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css\">     <title>Skills</title>   </head>   <body>       <div style=\"max-width: 640px; margin: 50px auto;\">   <h1 class=\"text-5xl\">Steve Rogers</h1>   <h2 class=\"text-4xl\">Skills</h2>   <ul>      <li>Shield Throwing</li>      <li>Bashing</li>      <li>Hammer Holding</li>    </ul>    <ul>   <li>Item 1</li>   <li>Item 2</li>   <li>Footer Item 3</li> </ul>  Footer  </div>    </body> </html> `;
}

Rhum.testPlan("template_engine_resource_test.ts", () => {
  Rhum.testSuite("/template-engine", () => {
    Rhum.testCase("renders a template properly", async () => {
      let response;

      response = await members.fetch.get(
        "http://localhost:3001/template-engine",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        getExpected(),
      );
    });
  });
});

Rhum.run();
