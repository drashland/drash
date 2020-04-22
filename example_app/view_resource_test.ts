import members from "../tests/members.ts";

// Will return a basic html file
members.test("ViewResource - Basic HTML", async () => {
  let response;

  response = await fetch(
    "http://localhost:1667/view?data=false&file=/index.html",
    {
      method: "GET",
      headers: {
        token: "zeToken",
      },
    },
  );
  members.assert.equals(
    await response.text(),
    '"<body>\\n    <h1>Hello Drash</h1>\\n</body>"',
  );
});
