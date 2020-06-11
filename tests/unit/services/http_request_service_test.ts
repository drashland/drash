import members from "../../members.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();

members.testSuite("services/http_request_service_test.ts", () => {

  const service = new Drash.Services.HttpRequestService();

  members.test("parseBodyAsFormUrlEncoded", async () => {
    const body = encoder.encode("hello=world");
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const request = members.mockRequest("/", "get", {
      body: reader
    });
    const actual = await service.parseBodyAsFormUrlEncoded(request);
    members.assertEquals(actual, {hello: "world"});
  });

  members.test("parseBodyAsJson", async () => {
    const body = encoder.encode(JSON.stringify({
      hello: "world",
    }));
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader
    });
    const actual = await service.parseBodyAsJson(request);
    members.assertEquals(actual, {hello: "world"});
  });

  // members.test("parseBodyAsMultipartFormData", async () => {
  //   const o = await Deno.open("./tests/data/multipart_1.txt");
  //   const actual = await service.parseBodyAsMultipartFormData(
  //     o,
  //     "----------------------------434049563556637648550474",
  //     128
  //   );
  //   members.assertEquals(actual, {hello: "world"});
  // });

  members.test("setHeaders", () => {
    const request = members.mockRequest();
    service.setHeaders(request, {
      hello: "world"
    });
    members.assertEquals(request.headers.get("hello"), "world");
  });

});
