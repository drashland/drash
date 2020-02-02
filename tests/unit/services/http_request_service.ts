import members from "../../members.ts";

members.test("-", () => {
  console.log("http_request_service.ts");
});

members.test("parseQueryParamsString()", () => {
  let actual;

  actual = members.Drash.Services.HttpRequestService.parseQueryParamsString(
    "these=are&query=params"
  );
  members.assert.equal(actual, { these: "are", query: "params" });
});

members.test("parseBodyAsMultipartFormData(): multiple parts (macOS)", async () => {
  let body = await Deno.open("./tests/data/multipart_1.txt");
  let parsed = await members.Drash.Services.HttpRequestService.parseBodyAsMultipartFormData(body);

  let expected = {
    foo: {
      "content_disposition": "form-data",
      "bytes": 5,
      "name": "foo",
      "filename": null,
      "content_type": "application/octet-stream",
      "contents": "foo\n\n"
    },
    bar: {
      "content_type": "application/octet-stream",
      "content_disposition": "form-data",
      "bytes": 5,
      "name": "bar",
      "filename": null,
      "contents": "bar\n\n"
    },
    file: {
      "content_disposition": "form-data",
      "bytes": 223,
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
}\n
`
    }
  };

  members.assert.equals(parsed, expected);
});

members.test("parseBodyAsMultipartFormData(): one part (macOS)", async () => {
  let body = await Deno.open("./tests/data/multipart_2.txt");
  let request = new mockRequest("/", "get", { "Content-Type": "multipart/form-data" });
  let parsed = await members.Drash.Services.HttpRequestService.parseBodyAsMultipartFormData(body);

  let expected = {
    file: {
      "content_disposition": "form-data",
      "bytes": 61,
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
        + "test\n\n"
    }
  };

  members.assert.equals(parsed, expected);
});

members.test("parseBodyAsMultipartFormData(): multiple parts (windows with ^M char)", async () => {
  let body = await Deno.open("./tests/data/multipart_3_mchar.txt");
  let parsed = await members.Drash.Services.HttpRequestService.parseBodyAsMultipartFormData(body);

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
      "bytes": 223,
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

members.test("parseBodyAsMultipartFormData(): one part (windows with ^M char)", async () => {
  let body = await Deno.open("./tests/data/multipart_4_mchar.txt");
  let parsed = await members.Drash.Services.HttpRequestService.parseBodyAsMultipartFormData(body);

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

