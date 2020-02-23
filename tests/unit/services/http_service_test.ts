import members from "../../members.ts";

members.test("--------------------------------------------------------", () => {
  console.log("\n       http_service.ts");
});

members.test("getMimeType(): file is not a URL", () => {
  let actual;

  actual = members.Drash.Services.HttpService.getMimeType(
    "/this/is/the/path.txt"
  );
  members.assert.equal(actual, "text/plain; charset=utf-8");

  actual = members.Drash.Services.HttpService.getMimeType(
    "/this/is/the/path.json"
  );
  members.assert.equal(actual, "application/json; charset=utf-8");

  actual = members.Drash.Services.HttpService.getMimeType(
    "/this/is/the/path.xml"
  );
  members.assert.equal(actual, "application/xml");

  actual = members.Drash.Services.HttpService.getMimeType(
    "/this/is/the/path.pdf"
  );
  members.assert.equal(actual, "application/pdf");
});

members.test("getMimeType(): file is a URL", () => {
  let actual;

  actual = members.Drash.Services.HttpService.getMimeType(
    "https://localhost:1337/this/is/the/path.txt"
  );
  members.assert.equal(actual, "text/plain; charset=utf-8");

  actual = members.Drash.Services.HttpService.getMimeType(
    "https://localhost:1337/this/is/the/path.json"
  );
  members.assert.equal(actual, "application/json; charset=utf-8");

  actual = members.Drash.Services.HttpService.getMimeType(
    "https://localhost:1337/this/is/the/path.xml"
  );
  members.assert.equal(actual, "application/xml");

  actual = members.Drash.Services.HttpService.getMimeType(
    "https://localhost:1337/this/is/the/path.pdf"
  );
  members.assert.equal(actual, "application/pdf");
});
