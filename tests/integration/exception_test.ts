import { Rhum, TestHelpers } from "../deps.ts";
import { Errors, Response, Server, Resource, ExceptionLayer } from "../../mod.ts";


class Resource1 extends Resource {
  paths = ["/"];

  public GET(_request: Request, _response: Response) {
    throw new Errors.HttpError(400, "request invalid");
  }
}

export class MyExceptionLayer implements ExceptionLayer {
  public catch(
    error: Errors.HttpError,
    _request: Request,
    response: Response
  ): void {
    response.status = error.code;
    response.json({error: error.message});
  }
}

export class MyErrorExceptionLayer implements ExceptionLayer {
  public catch(
    _error: Errors.HttpError,
    _request: Request,
    _response: Response
  ): void {
    throw new Errors.HttpError(500, "error on exceptionLayer");
  }
}

Rhum.testPlan("exception_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("default error response", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource1]
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 400);
      Rhum.asserts.assertEquals((await res.text()).startsWith('Error: request invalid\n'), true);
    });

    Rhum.testCase("custom error response", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource1],
        exception: new MyExceptionLayer()
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 400);
      Rhum.asserts.assertEquals(await res.json(), {error: "request invalid"});
    });

    Rhum.testCase("custom exceptionLayer thrown error", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource1],
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
