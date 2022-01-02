import { Rhum, TestHelpers } from "../deps.ts";
import { Errors, Response, Server, ExceptionLayer } from "../../mod.ts";

class MyExceptionLayer extends ExceptionLayer {
  public catch(error: Errors.HttpError, _request: Request, response: Response) {
    response.status = error.code;
    response.json({error: error.message});
  }
}

class MyErrorExceptionLayer extends ExceptionLayer {
  public catch(_error: Errors.HttpError, _request: Request, _response: Response) {
    throw new Errors.HttpError(500, "error on exceptionLayer");
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
      Rhum.asserts.assertEquals((await res.text()).startsWith('Error: Not Found\n'), true);
    });

    Rhum.testCase("custom exceptionLayer", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        exception: new MyExceptionLayer()
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
        exception: new MyErrorExceptionLayer()
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 500);
      Rhum.asserts.assertEquals((await res.text()).startsWith('Error: error on exceptionLayer\n'), true);
    });
  });
});

Rhum.run();
