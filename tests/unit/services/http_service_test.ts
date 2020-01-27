import members from "../../members.ts";

members.test("-", () => {
  console.log("http_service.ts");
});

members.test("hydrateHttpRequest(): request.url_path", () => {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_path;
  members.assert.equal(actual, "/this/is/the/path");
});

members.test("hydrateHttpRequest(): request.url_query_string", () => {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_query_string;
  members.assert.equal(actual, "these=are&query=params");
});

members.test("hydrateHttpRequest(): request.url_query_params", () => {
  let request = members.mockRequest("/this/is/the/path?these=are&query=params");
  let actual = request.url_query_params;
  members.assert.equal(actual, { these: "are", query: "params" });
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

members.test("parseQueryParamsString()", () => {
  let actual;

  actual = members.Drash.Services.HttpService.parseQueryParamsString(
    "these=are&query=params"
  );
  members.assert.equal(actual, { these: "are", query: "params" });
});

members.test("parseMultipartFormDataParts(): multiple parts (macOS)", async () => {
  let body = await Deno.readAll(await Deno.open("./tests/data/multipart_1.txt"));
  let parsed = await members.Drash.Services.HttpService.parseMultipartFormDataParts(body);

  let expected = {
    foo: {
      "content_disposition": "form-data",
      "bytes": 4,
      "name": "foo",
      "filename": null,
      "content_type": "application/octet-stream",
      "contents": "foo\n"
    },
    bar: {
      "content_type": "application/octet-stream",
      "content_disposition": "form-data",
      "bytes": 4,
      "name": "bar",
      "filename": null,
      "contents": "bar\n"
    },
    file: {
      "content_disposition": "form-data",
      "bytes": 222,
      "name": "file",
      "filename": "tsconfig.json",
      "content_type": "application/octet-stream",
      "contents": `{
  "compilerOptions": {
    "target": "es2018",
    "baseUrl": ".",
    "paths": {
      "deno": ["./deno.d.ts"],
      "https://*": ["../../.deno/deps/https/*"],
      "http://*": ["../../.deno/deps/http/*"]
    }
  }
}
`
    }
  };

  members.assert.equals(parsed, expected);
});

members.test("parseMultipartFormDataParts(): one part (macOS)", async () => {
  let body = await Deno.readAll(await Deno.open("./tests/data/multipart_2.txt"));
  let parsed = await members.Drash.Services.HttpService.parseMultipartFormDataParts(body);

  let expected = {
    file: {
      "content_disposition": "form-data",
      "bytes": 60,
      "name": "file",
      "filename": "hello.txt",
      "content_type": "text/plain",
      "contents": "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
    }
  };

  members.assert.equals(parsed, expected);
});

members.test("parseMultipartFormDataParts(): multiple parts (windows with ^M char)", async () => {
  let body = await Deno.readAll(await Deno.open("./tests/data/multipart_3_mchar.txt"));
  let parsed = await members.Drash.Services.HttpService.parseMultipartFormDataParts(body);

  let expected = {
    foo: {
      "content_disposition": "form-data",
      "bytes": 4,
      "name": "foo",
      "filename": null,
      "content_type": "application/octet-stream",
      "contents": "foo\n"
    },
    bar: {
      "content_type": "application/octet-stream",
      "content_disposition": "form-data",
      "bytes": 4,
      "name": "bar",
      "filename": null,
      "contents": "bar\n"
    },
    file: {
      "content_disposition": "form-data",
      "bytes": 222,
      "name": "file",
      "filename": "tsconfig.json",
      "content_type": "application/octet-stream",
      "contents": `{
  "compilerOptions": {
    "target": "es2018",
    "baseUrl": ".",
    "paths": {
      "deno": ["./deno.d.ts"],
      "https://*": ["../../.deno/deps/https/*"],
      "http://*": ["../../.deno/deps/http/*"]
    }
  }
}
`
    }
  };

  members.assert.equals(parsed, expected);
});

members.test("parseMultipartFormDataParts(): one part (windows with ^M char)", async () => {
  let body = await Deno.readAll(await Deno.open("./tests/data/multipart_4_mchar.txt"));
  let parsed = await members.Drash.Services.HttpService.parseMultipartFormDataParts(body);

  let expected = {
    foo: {
      "content_disposition": "form-data",
      "bytes": 4,
      "name": "foo",
      "filename": null,
      "content_type": "application/octet-stream",
      "contents": "foo\n"
    }
  };

  members.assert.equals(parsed, expected);
});
