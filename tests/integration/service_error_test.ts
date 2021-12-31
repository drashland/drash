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

class ServiceError2 extends Service {
  runBeforeResource(_request: Request, _response: Response) {
    throw new Errors.HttpError(500, "runBeforeResource error");
  }
}

class ServiceError3 extends Service {
  runAfterResource(_request: Request, _response: Response) {
    throw new Errors.HttpError(500, "runAfterResource error");
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

class Resource4 extends Resource {
  paths = ["/"];

  public GET(_request: Request, response: Response) {
    return response.text("ok");
  }
}

Rhum.testPlan("service_error_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("First runOnError is in MethodService", async () => {
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

    Rhum.testCase("Second runOnError is in ClassService", async () => {
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

    Rhum.testCase("Third runOnError is in ServerService", async () => {
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

    Rhum.testCase("error on runOnError()", async () => {
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

    Rhum.testCase("error on runBeforeResource()", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource4],
        services: [new ServiceError2(),new ServerService()]
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 500);
      Rhum.asserts.assertEquals(await res.json(), {error:"runBeforeResource error", service:"ServerService"});
    });

    Rhum.testCase("error on runAfterResource()", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [Resource4],
        services: [new ServiceError3(),new ServerService()]
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address)
      await server.close();

      Rhum.asserts.assertEquals(res.status, 500);
      Rhum.asserts.assertEquals(await res.json(), {error:"runAfterResource error", service:"ServerService"});
    });
  });
});

Rhum.run();
