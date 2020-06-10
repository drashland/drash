import members from "../../members.ts";

function getExpected() {
  if (Deno.build.os == "windows") {
    return "<body>      <h1>Hello Drash</h1>  </body>";
  }
  return "<body>     <h1>Hello Drash</h1> </body>";
}

members.testSuite("ViewResource", () => {
  members.test("basic HTML can be served", async () => {
    const response = await fetch(
      "http://localhost:3001/view?data=false&file=/index.html",
      {
        method: "GET",
      },
    );
    members.assertEquals(
      await response.text(),
      getExpected(),
    );
  });
});
