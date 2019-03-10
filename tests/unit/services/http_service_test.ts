import members from "../../members.ts";

members.test(function HttpService_hydrateHttpRequest() {
  let request = members.mockRequest(
    "/?what=the&ok=then&kthx=bye&empty=&cmon_now",
    "get",
    {},
    false
  );
  request = members.Drash.Services.HttpService.hydrateHttpRequest(request);
  members.assert.equal(request.url_query_params, {
    what: "the",
    ok: "then",
    kthx: "bye",
    empty: "",
    cmon_now: undefined
  });
  members.assert.equal(request.url_query_string, "what=the&ok=then&kthx=bye&empty=&cmon_now");
  members.assert.equal(request.url_path, "/");
});

members.test(function HttpService_getHttpRequestUrlQueryParams() {
  let request = members.mockRequest(
    "/?what=the&ok=then&kthx=bye&empty=&cmon_now",
    "get",
    {},
    false
  );
  let actual = members.Drash.Services.HttpService.getHttpRequestUrlQueryParams(
    request
  );
  members.assert.equal(actual, {
    what: "the",
    ok: "then",
    kthx: "bye",
    empty: "",
    cmon_now: undefined
  });
});

members.test(function HttpService_getMimeType() {
  let actual;

  let data = {
    ".js": "application/javascript",
    ".html": "text/html",
    ".json": "application/json",
    css: "text/css"
  };

  for (let extension in data) {
    actual = members.Drash.Services.HttpService.getMimeType(
      `some/path/file.${extension}?some=param`,
      true
    );
    members.assert.equal(actual, data[extension]);

    actual = members.Drash.Services.HttpService.getMimeType(
      `some/path/file.${extension}`,
      true
    );
    members.assert.equal(actual, data[extension]);

    actual = members.Drash.Services.HttpService.getMimeType(
      `file.${extension}`
    );
    members.assert.equal(actual, data[extension]);
  }
});

members.test(function HttpService_getHttpRequestUrlPath() {
  let actual;
  let request;

  request = members.mockRequest("/what/the/?ok=then");
  actual = members.Drash.Services.HttpService.getHttpRequestUrlPath(request);
  members.assert.equal(actual, "/what/the/");

  request = members.mockRequest("/what/the");
  actual = members.Drash.Services.HttpService.getHttpRequestUrlPath(request);
  members.assert.equal(actual, "/what/the");

  request = members.mockRequest("/what/what");
  actual = members.Drash.Services.HttpService.getHttpRequestUrlPath(request);
  members.assert.equal(actual, "/what/what");

  request = members.mockRequest("/");
  actual = members.Drash.Services.HttpService.getHttpRequestUrlPath(request);
  members.assert.equal(actual, "/");
});

members.test(function HttpService_getHttpRequestUrlQueryString() {
  let actual;
  let request;

  request = members.mockRequest("/what/the?ok=then");
  actual = members.Drash.Services.HttpService.getHttpRequestUrlQueryString(request);
  members.assert.equal(actual, "ok=then");

  request = members.mockRequest("/what/the");
  actual = members.Drash.Services.HttpService.getHttpRequestUrlQueryString(request);
  members.assert.equal(actual, null);
});
