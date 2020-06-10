import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

members.testSuite("services/http_service_test.ts", () => {

  members.test("getMimeType(): file is not a URL", () => {
    let actual;
    actual = new Drash.Services.HttpService().getMimeType(
      "/this/is/the/path.txt",
    );
    members.assertEquals(actual, "text/plain");
    actual = new Drash.Services.HttpService().getMimeType(
      "/this/is/the/path.json",
    );
    members.assertEquals(actual, "application/json");
    actual = new Drash.Services.HttpService().getMimeType(
      "/this/is/the/path.xml",
    );
    members.assertEquals(actual, "application/xml");
    actual = new Drash.Services.HttpService().getMimeType(
      "/this/is/the/path.pdf",
    );
    members.assertEquals(actual, "application/pdf");
  });

  members.test("getMimeType(): file is a URL", () => {
    let actual;
    actual = new Drash.Services.HttpService().getMimeType(
      "https://localhost:1337/this/is/the/path.txt",
    );
    members.assertEquals(actual, "text/plain");
    actual = new Drash.Services.HttpService().getMimeType(
      "https://localhost:1337/this/is/the/path.json",
    );
    members.assertEquals(actual, "application/json");
    actual = new Drash.Services.HttpService().getMimeType(
      "https://localhost:1337/this/is/the/path.xml",
    );
    members.assertEquals(actual, "application/xml");
    actual = new Drash.Services.HttpService().getMimeType(
      "https://localhost:1337/this/is/the/path.pdf",
    );
    members.assertEquals(actual, "application/pdf");
  });

});
