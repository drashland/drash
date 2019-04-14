import members from "../../members.ts";

members.test(function Services_HttpService_getHttpRequestUrlPath() {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_path;
  members.assert.equal(
    actual,
    "/this/is/the/path"
  );
});

members.test(function Services_HttpService_getHttpRequestUrlQueryString() {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_query_string;
  members.assert.equal(
    actual,
    "these=are&query=params"
  );
});

members.test(function Services_HttpService_getHttpRequestUrlQueryParams() {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_query_params;
  members.assert.equal(
    actual,
    {these: "are", query: "params"}
  );
});

members.test(function Services_HttpService_getMimeType_fileIsNotUrl() {
  let actual;

  actual = members.Drash.Services.HttpService.getMimeType("/this/is/the/path.txt");
  members.assert.equal(actual, "text/plain");

  actual = members.Drash.Services.HttpService.getMimeType("/this/is/the/path.json");
  members.assert.equal(actual, "application/json");

  actual = members.Drash.Services.HttpService.getMimeType("/this/is/the/path.xml");
  members.assert.equal(actual, "application/xml");

  actual = members.Drash.Services.HttpService.getMimeType("/this/is/the/path.pdf");
  members.assert.equal(actual, "application/pdf");
});

members.test(function Services_HttpService_getMimeType_fileIsUrl() {
  let actual;

  actual = members.Drash.Services.HttpService.getMimeType("https://localhost:1337/this/is/the/path.txt");
  members.assert.equal(actual, "text/plain");

  actual = members.Drash.Services.HttpService.getMimeType("https://localhost:1337/this/is/the/path.json");
  members.assert.equal(actual, "application/json");

  actual = members.Drash.Services.HttpService.getMimeType("https://localhost:1337/this/is/the/path.xml");
  members.assert.equal(actual, "application/xml");

  actual = members.Drash.Services.HttpService.getMimeType("https://localhost:1337/this/is/the/path.pdf");
  members.assert.equal(actual, "application/pdf");
});

members.test(function Services_HttpService_parseQueryParamsString() {
  let actual;

  actual = members.Drash.Services.HttpService.parseQueryParamsString("these=are&query=params");
  members.assert.equal(actual, {these: "are", query: "params"});
});
