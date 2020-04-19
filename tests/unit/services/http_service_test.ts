import members from "../../members.ts";

members.test("http_service_test.ts | getMimeType(): file is not a URL", () => {
  let actual;

  actual = new members.Drash.Services.HttpService().getMimeType(
    "/this/is/the/path.txt",
  );
  members.assert.equal(actual, "text/plain");

  actual = new members.Drash.Services.HttpService().getMimeType(
    "/this/is/the/path.json",
  );
  members.assert.equal(actual, "application/json");

  actual = new members.Drash.Services.HttpService().getMimeType(
    "/this/is/the/path.xml",
  );
  members.assert.equal(actual, "application/xml");

  actual = new members.Drash.Services.HttpService().getMimeType(
    "/this/is/the/path.pdf",
  );
  members.assert.equal(actual, "application/pdf");
});

members.test("http_service_test.ts | getMimeType(): file is a URL", () => {
  let actual;

  actual = new members.Drash.Services.HttpService().getMimeType(
    "https://localhost:1337/this/is/the/path.txt",
  );
  members.assert.equal(actual, "text/plain");

  actual = new members.Drash.Services.HttpService().getMimeType(
    "https://localhost:1337/this/is/the/path.json",
  );
  members.assert.equal(actual, "application/json");

  actual = new members.Drash.Services.HttpService().getMimeType(
    "https://localhost:1337/this/is/the/path.xml",
  );
  members.assert.equal(actual, "application/xml");

  actual = new members.Drash.Services.HttpService().getMimeType(
    "https://localhost:1337/this/is/the/path.pdf",
  );
  members.assert.equal(actual, "application/pdf");
});
