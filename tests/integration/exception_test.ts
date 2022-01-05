import { Rhum, TestHelpers } from "../deps.ts";
import { Errors, Response, Server, ErrorHandler } from "../../mod.ts";

class MyExceptionLayer extends ErrorHandler {
  public catch(error: Error, _request: Request, response: Response) {
    if (error instanceof Errors.HttpError) {
      response.status = error.code;
    }
    response.json({error: error.message});
  }
}

class MyErrorExceptionLayer extends ErrorHandler {
  public catch(_error: Error, _request: Request, _response: Response) {
    throw new Errors.HttpError(500, "error on exceptionLayer");
  }
}

class MyOwnExceptionLayer {
  public catch(error: Error, _request: Request, response: Response) {
    if (error instanceof Errors.HttpError) {
      response.status = error.code;
    }
    response.json({error: error.message});
  }
}

Rhum.testPlan("exception_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("default exceptionLayer", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: []
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 404);
      Rhum.asserts.assertEquals((await res.text()).includes('Error: Not Found\n'), true);
    });

    Rhum.testCase("custom exceptionLayer", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MyExceptionLayer
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 404);
      Rhum.asserts.assertEquals(await res.json(), {error: "Not Found"});
    });

    Rhum.testCase("custom exceptionLayer thrown error", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MyErrorExceptionLayer
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 500);
      Rhum.asserts.assertEquals((await res.text()).includes('Error: error on exceptionLayer\n'), true);
    });

    Rhum.testCase("custom exceptionLayer without extends", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MyOwnExceptionLayer
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 404);
      Rhum.asserts.assertEquals(await res.json(), {error: "Not Found"});
    });
  });
});

Rhum.run();
