import { Rhum, TestHelpers } from "../deps.ts";
import { ErrorService, Errors, Response, Server } from "../../mod.ts";

class MyErrorService extends ErrorService {
  runOnError(error: Errors.HttpError, response: Response): Response {
    response.status = error.code;
    response.json({error: error.message});
    return response;
  }
}

const serverWithoutErrorService = new Server({
  protocol: "http",
  hostname: "localhost",
  port: 3000,
  resources: []
});

const serverWithErrorService = new Server({
  protocol: "http",
  hostname: "localhost",
  port: 3000,
  resources: [],
  error_service: new MyErrorService()
});

Rhum.testPlan("error_service_test.ts", () => {
    Rhum.testSuite("/inexistent_path", () => {
      Rhum.testCase("test default ErrorService", async () => {
        serverWithoutErrorService.run();
        const response = await TestHelpers.makeRequest.get("http://localhost:3000/inexistent_path");
        await serverWithoutErrorService.close();
        Rhum.asserts.assertEquals(response.status, 404);
        Rhum.asserts.assertEquals(await response.text(),
          `Error: Not Found
    at Server.<anonymous> (file:///home/tom/drash/src/http/server.ts:225:17)
    at async Server.#respond (https://deno.land/std@0.119.0/http/server.ts:298:18)`
        );
      });

      Rhum.testCase("test MyErrorService", async () => {
        serverWithErrorService.run();
        const response = await TestHelpers.makeRequest.get("http://localhost:3000/inexistent_path");
        await serverWithErrorService.close();
        Rhum.asserts.assertEquals(response.status, 404);
        Rhum.asserts.assertEquals(await response.json(), {error: "Not Found"});
      });
    });
});

Rhum.run();
