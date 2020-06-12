import members from "../../members.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();

members.testSuite("services/http_request_service_test.ts", () => {
  const service = new Drash.Services.HttpRequestService();

  members.test("accepts() correctly parses the Accept header", () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
      },
    });
    let actual;
    actual = service.accepts(request, "application/json");
    members.assertEquals("application/json", actual);
    actual = service.accepts(request, "text/html");
    members.assertEquals("text/html", actual);
    actual = service.accepts(request, "text/xml");
    members.assertEquals(false, actual);
  });

  members.test("getBodyParam() gets the body param", async () => {
    const body = encoder.encode(JSON.stringify({
      hello: "world",
    }));
    const reader = new Deno.Buffer(body as ArrayBuffer);
    let request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    request = await service.hydrate(request);
    const actual = request.getBodyParam("hello");
    members.assertEquals("world", actual);
  });

  members.test("getHeaderParam() gets the header param", async () => {
    let request = members.mockRequest("/", "get", {
      headers: {
        hello: "world",
      },
    });
    request = await service.hydrate(request);
    const actual = request.getHeaderParam("hello");
    members.assertEquals("world", actual);
  });

  members.test("getPathParam() gets the URL query param", async () => {
    let request = members.mockRequest();
    request = await service.hydrate(request);
    request.path_params = {
      hello: "world",
    };
    const actual = request.getPathParam("hello");
    members.assertEquals("world", actual);
  });

  members.test("getUrlQueryParam() gets the URL query param", async () => {
    let request = members.mockRequest("/?hello=world");
    request = await service.hydrate(request);
    const actual = request.getUrlQueryParam("hello");
    members.assertEquals("world", actual);
  });

  members.test("hydrate()", async () => {
    let request = members.mockRequest();
    request = await service.hydrate(request);
    members.assertEquals("function", typeof request.getBodyFile);
    members.assertEquals("function", typeof request.getBodyParam);
    members.assertEquals("function", typeof request.getHeaderParam);
    members.assertEquals("function", typeof request.getUrlQueryParam);
  });

  members.test("parseBodyAsFormUrlEncoded() can parse hello=world into an object", async () => {
    const body = encoder.encode("hello=world");
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const request = members.mockRequest("/", "get", {
      body: reader,
    });
    const actual = await service.parseBodyAsFormUrlEncoded(request);
    members.assertEquals(actual, { hello: "world" });
  });

  members.test("parseBodyAsFormUrlEncoded() can parse hello=world into an object", async () => {
    const body = encoder.encode("hello=world");
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: reader,
    });
    const actual = await service.parseBodyAsFormUrlEncoded(request);
    members.assertEquals(actual, { hello: "world" });
  });

  members.test(`parseBodyAsJson() can parse '{"hello":"world"}' into an object`, async () => {
    const body = encoder.encode(JSON.stringify({
      hello: "world",
    }));
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    const actual = await service.parseBodyAsJson(request);
    members.assertEquals(actual, { hello: "world" });
  });

  // members.test("parseBodyAsMultipartFormData() can parse files", async () => {
  //   const o = await Deno.open("./tests/data/multipart_1.txt");
  //   const actual = await service.parseBodyAsMultipartFormData(
  //     o,
  //     "----------------------------434049563556637648550474",
  //     128
  //   );
  //   members.assertEquals(actual, {hello: "world"});
  // });

  members.test("setHeaders() sets headers on the specified request", () => {
    const request = members.mockRequest();
    service.setHeaders(request, {
      hello: "world",
    });
    members.assertEquals(request.headers.get("hello"), "world");
  });
});
