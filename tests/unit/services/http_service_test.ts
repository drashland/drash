import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import members from "../../members.ts";

Rhum.testPlan("services/http_service_test.ts", () => {
  Rhum.testSuite("accepts()", () => {
    Rhum.testCase(
      "accepts the single type if it is present in the header",
      () => {
        const request = members.createDrashRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        const service = new Drash.Services.HttpService();
        actual = service.accepts(request, "application/json");
        Rhum.asserts.assertEquals("application/json", actual);
        actual = service.accepts(request, "text/html");
        Rhum.asserts.assertEquals("text/html", actual);
      },
    );
    Rhum.testCase(
      "rejects the single type if it is not present in the header",
      () => {
        const request = members.createDrashRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        const service = new Drash.Services.HttpService();
        actual = service.accepts(request, "text/xml");
        Rhum.asserts.assertEquals(false, actual);
      },
    );
    Rhum.testCase(
      "accepts the first of multiple types if it is present in the header",
      () => {
        const request = members.createDrashRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        const service = new Drash.Services.HttpService();
        actual = service.accepts(request, ["application/json", "text/xml"]);
        Rhum.asserts.assertEquals("application/json", actual);
      },
    );
    Rhum.testCase(
      "accepts the second of multiple types if it is present in the header",
      () => {
        const request = members.createDrashRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        const service = new Drash.Services.HttpService();
        actual = service.accepts(request, ["text/xml", "application/json"]);
        Rhum.asserts.assertEquals("application/json", actual);
      },
    );
    Rhum.testCase(
      "rejects the multiple types if none are present in the header",
      () => {
        const request = members.createDrashRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        const service = new Drash.Services.HttpService();
        actual = service.accepts(request, ["text/xml", "text/plain"]);
        Rhum.asserts.assertEquals(false, actual);
      },
    );
  });
  Rhum.testSuite("getMimeType()", () => {
    Rhum.testCase("file is not a URL", () => {
      let actual;
      actual = new Drash.Services.HttpService().getMimeType(
        "/this/is/the/path.txt",
      );
      Rhum.asserts.assertEquals(actual, "text/plain");
      actual = new Drash.Services.HttpService().getMimeType(
        "/this/is/the/path.json",
      );
      Rhum.asserts.assertEquals(actual, "application/json");
      actual = new Drash.Services.HttpService().getMimeType(
        "/this/is/the/path.xml",
      );
      Rhum.asserts.assertEquals(actual, "application/xml");
      actual = new Drash.Services.HttpService().getMimeType(
        "/this/is/the/path.pdf",
      );
      Rhum.asserts.assertEquals(actual, "application/pdf");
    });

    Rhum.testCase("file is a URL", () => {
      let actual;
      actual = new Drash.Services.HttpService().getMimeType(
        "https://localhost:1337/this/is/the/path.txt",
      );
      Rhum.asserts.assertEquals(actual, "text/plain");
      actual = new Drash.Services.HttpService().getMimeType(
        "https://localhost:1337/this/is/the/path.json",
      );
      Rhum.asserts.assertEquals(actual, "application/json");
      actual = new Drash.Services.HttpService().getMimeType(
        "https://localhost:1337/this/is/the/path.xml",
      );
      Rhum.asserts.assertEquals(actual, "application/xml");
      actual = new Drash.Services.HttpService().getMimeType(
        "https://localhost:1337/this/is/the/path.pdf",
      );
      Rhum.asserts.assertEquals(actual, "application/pdf");
    });
  });
});

Rhum.run();
