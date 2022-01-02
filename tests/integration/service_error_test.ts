import { Rhum, TestHelpers } from "../deps.ts";
import { Errors, Response, Server, Service, Resource } from "../../mod.ts";

class ServerService extends Service {
  runOnError(error: Errors.HttpError, response: Response): Response {
    response.status = error.code;
    response.json({error: error.message, service: "ServerService"});
    return response;
  }
}

class ClassService extends Service {
  runOnError(error: Errors.HttpError, response: Response): Response {
    response.status = error.code;
    response.json({error: error.message, service: "ClassService"});
    return response;
  }
}

class MethodService extends Service {
  runOnError(error: Errors.HttpError, response: Response): Response {
    response.status = error.code;
    response.json({error: error.message, service: "MethodService"});
    return response;
  }
}

class ServiceError extends Service {
  runOnError(_error: Errors.HttpError, _response: Response): Response {
    throw new Errors.HttpError(500, "error on serviceError");
  }
}

class Resource1 extends Resource {
  paths = ["/"];

  public services = {
    "ALL": [new ClassService()],
    "GET": [new MethodService()],
  };

  public GET(_request: Request, _response: Response) {
    throw new Errors.HttpError(400, "request invalid");
  }
}

class Resource2 extends Resource {
  paths = ["/"];

  public services = {
    "ALL": [new ClassService()],
  };

  public GET(_request: Request, _response: Response) {
    throw new Errors.HttpError(400, "request invalid");
  }
}

class Resource3 extends Resource {
  paths = ["/"];

  public GET(_request: Request, _response: Response) {
    throw new Errors.HttpError(400, "request invalid");
  }
}

Rhum.testPlan("service_error_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("First serviceError is MethodService", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource1],
        services: [new ServerService()]
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 400);
      Rhum.asserts.assertEquals(await res.json(), {error: "request invalid", service: "MethodService"});
    });

    Rhum.testCase("Second serviceError is ClassService", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource2],
        services: [new ServerService()]
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 400);
      Rhum.asserts.assertEquals(await res.json(), {error: "request invalid", service: "ClassService"});
    });

    Rhum.testCase("Third serviceError is ServerService", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource3],
        services: [new ServerService()]
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 400);
      Rhum.asserts.assertEquals(await res.json(), {error: "request invalid", service: "ServerService"});
    });

    Rhum.testCase("default error response", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource3]
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 400);
      Rhum.asserts.assertEquals((await res.text()).startsWith('Error: request invalid\n'), true);
    });

    Rhum.testCase("error on ServiceError", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource3],
        services: [new ServiceError()]
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 500);
      Rhum.asserts.assertEquals((await res.text()).startsWith('Error: error on serviceError\n'), true);
    });
  });
});

Rhum.run();
