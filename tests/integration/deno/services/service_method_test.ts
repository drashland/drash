import { assertEquals, Drash, TestHelpers } from "../deps.ts";

// FILE MARKER - APP SETUP /////////////////////////////////////////////////////

class ServerService implements Drash.Interfaces.Service {
  runBeforeResource(_request: Drash.Request, response: Drash.Response) {
    return response.headers({ "X-SERVER-SERVICE-BEFORE": "hi" });
  }
  runAfterResource(_request: Drash.Request, response: Drash.Response) {
    return response.headers({ "X-SERVER-SERVICE-AFTER": "hi" });
  }
}

const serverService = new ServerService();

class ClassService implements Drash.Interfaces.Service {
  runBeforeResource(_request: Drash.Request, response: Drash.Response) {
    return response.headers({ "X-CLASS-SERVICE-BEFORE": "hi" });
  }
  runAfterResource(_request: Drash.Request, response: Drash.Response) {
    return response.headers({ "X-CLASS-SERVICE-AFTER": "hi" });
  }
}

const classService = new ClassService();

class MethodService implements Drash.Interfaces.Service {
  runBeforeResource(_request: Drash.Request, response: Drash.Response) {
    return response.headers({ "X-METHOD-SERVICE-BEFORE": "hi" });
  }
  runAfterResource(_request: Drash.Request, response: Drash.Response) {
    return response.headers({ "X-METHOD-SERVICE-AFTER": "hi" });
  }
}

const methodService = new MethodService();

class Resource1 extends Drash.Resource {
  paths = ["/"];

  public services = {
    "ALL": [classService],
    "GET": [methodService],
  };

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.text("done");
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const drashRequestHandler = await Drash.createRequestHandler({
    resources: [Resource1],
    services: [serverService],
  });

  const denoRequestHandler = (request: Request) => {
    return drashRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(1234)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

// FILE MARKER - TESTS /////////////////////////////////////////////////////////

Deno.test("Class middleware should run", async () => {
  const server = await runServer();
  const res = await fetch(server.address, {
    headers: {
      Accept: "text/plain",
    },
  });
  await res.text();
  await server.close();
  assertEquals(res.headers.get("X-CLASS-SERVICE-BEFORE"), "hi");
  assertEquals(res.headers.get("X-CLASS-SERVICE-AFTER"), "hi");
});

Deno.test("Method middleware should run", async () => {
  const server = await runServer();
  const res = await fetch(server.address, {
    headers: {
      Accept: "text/plain",
    },
  });
  await res.text();
  await server.close();
  assertEquals(res.headers.get("X-METHOD-SERVICE-BEFORE"), "hi");
  assertEquals(res.headers.get("X-METHOD-SERVICE-AFTER"), "hi");
});

Deno.test("Server middleware should run", async () => {
  const server = await runServer();
  const res = await fetch(server.address, {
    headers: {
      Accept: "text/plain",
    },
  });
  await res.text();
  await server.close();
  assertEquals(res.headers.get("X-SERVER-SERVICE-BEFORE"), "hi");
  assertEquals(res.headers.get("X-SERVER-SERVICE-AFTER"), "hi");
});
