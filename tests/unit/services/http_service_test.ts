import members from "../../members.ts";

members.test("Services.HttpService.hydrateHttpRequest(): request.url_path", () => {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_path;
  members.assert.equal(actual, "/this/is/the/path");
});

members.test("Services.HttpService.hydrateHttpRequest(): request.url_query_string", () => {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_query_string;
  members.assert.equal(actual, "these=are&query=params");
});

members.test("Services.HttpService.hydrateHttpRequest(): request.url_query_params", () => {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_query_params;
  members.assert.equal(actual, { these: "are", query: "params" });
});

members.test("Services.HttpService.getMimeType(): file is not a URL", () => {
  let actual;

  actual = members.Drash.Services.HttpService.getMimeType(
    "/this/is/the/path.txt"
  );
  members.assert.equal(actual, "text/plain");

  actual = members.Drash.Services.HttpService.getMimeType(
    "/this/is/the/path.json"
  );
  members.assert.equal(actual, "application/json");

  actual = members.Drash.Services.HttpService.getMimeType(
    "/this/is/the/path.xml"
  );
  members.assert.equal(actual, "application/xml");

  actual = members.Drash.Services.HttpService.getMimeType(
    "/this/is/the/path.pdf"
  );
  members.assert.equal(actual, "application/pdf");
});

members.test("Services.HttpService.getMimeType(): file is a URL", () => {
  let actual;

  actual = members.Drash.Services.HttpService.getMimeType(
    "https://localhost:1337/this/is/the/path.txt"
  );
  members.assert.equal(actual, "text/plain");

  actual = members.Drash.Services.HttpService.getMimeType(
    "https://localhost:1337/this/is/the/path.json"
  );
  members.assert.equal(actual, "application/json");

  actual = members.Drash.Services.HttpService.getMimeType(
    "https://localhost:1337/this/is/the/path.xml"
  );
  members.assert.equal(actual, "application/xml");

  actual = members.Drash.Services.HttpService.getMimeType(
    "https://localhost:1337/this/is/the/path.pdf"
  );
  members.assert.equal(actual, "application/pdf");
});

members.test("Services.HttpService.parseQueryParamsString()", () => {
  let actual;

  actual = members.Drash.Services.HttpService.parseQueryParamsString(
    "these=are&query=params"
  );
  members.assert.equal(actual, { these: "are", query: "params" });
});
