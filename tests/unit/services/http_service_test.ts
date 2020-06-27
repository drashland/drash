import { Rhum } from "../../test_deps.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("services/http_service_test.ts", () => {
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
