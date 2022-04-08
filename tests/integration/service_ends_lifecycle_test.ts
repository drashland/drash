import {
  Errors,
  IResource,
  IService,
  Request,
  Resource,
  Response,
  Server,
  Service,
} from "../../mod.ts";
import { assertEquals } from "../deps.ts";

class MethodService extends Service implements IService {
  async runBeforeResource(request: Request, response: Response) {
    response.headers.set("x-method-service-before", "started");
    if (request.queryParam("method-before") === "wait") {
      request.end();
      const p = new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
      await p;
      return;
    }
    if (request.queryParam("method-before") === "throw") {
      throw new Errors.HttpError(419, "Method Service Before threw");
    }
    if (request.queryParam("method-before") === "end") {
      response.text("method before ended");
      return request.end();
    }
    response.headers.set("x-method-service-before", "finished");
  }

  runAfterResource(request: Request, response: Response) {
    response.headers.set("x-method-service-after", "started");
    if (request.queryParam("method-after") === "throw") {
      throw new Errors.HttpError(419, "Method Service After threw");
    }
    if (request.queryParam("method-after") === "end") {
      response.text("method after ended");
      return request.end();
    }
    response.headers.set("x-method-service-after", "finished");
  }
}

class ServerService extends Service implements IService {
  async runBeforeResource(request: Request, response: Response) {
    response.headers.set("x-server-service-before", "started");
    if (request.queryParam("server-before") === "wait") {
      request.end();
      const p = new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
      await p;
      return;
    }
    if (request.queryParam("server-before") === "throw") {
      throw new Errors.HttpError(419, "Server Service Before threw");
    }
    if (request.queryParam("server-before") === "end") {
      response.text("server before ended");
      return request.end();
    }
    response.headers.set("x-server-service-before", "finished");
  }
  runAfterResource(request: Request, response: Response) {
    response.headers.set("x-server-service-after", "started");
    if (request.queryParam("server-after") === "throw") {
      throw new Errors.HttpError(419, "Server Service After threw");
    }
    if (request.queryParam("server-after") === "end") {
      response.text("server after ended");
      return request.end();
    }
    response.headers.set("x-server-service-after", "finished");
  }
}

class ClassService extends Service implements IService {
  async runBeforeResource(request: Request, response: Response) {
    response.headers.set("x-class-service-before", "started");
    if (request.queryParam("class-before") === "wait") {
      request.end();
      const p = new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
      await p;
      return;
    }
    if (request.queryParam("class-before") === "throw") {
      throw new Errors.HttpError(419, "Class Service Before threw");
    }
    if (request.queryParam("class-before") === "end") {
      response.text("class before ended");
      return request.end();
    }
    response.headers.set("x-class-service-before", "finished");
  }
  runAfterResource(request: Request, response: Response) {
    response.headers.set("x-class-service-after", "started");
    if (request.queryParam("class-after") === "throw") {
      throw new Errors.HttpError(419, "Class Service After threw");
    }
    if (request.queryParam("class-after") === "end") {
      response.text("class after ended");
      return request.end();
    }
    response.headers.set("x-class-service-after", "finished");
  }
}

class Resource1 extends Resource implements IResource {
  paths = ["/"];

  public services = {
    "GET": [new MethodService()],
    ALL: [new ClassService()],
  };

  public GET(_request: Request, response: Response) {
    response.text("GET called");
    response.headers.set("x-resource-called", "true");
  }
}

function getServer(port?: number) {
  return new Server({
    protocol: "http",
    port: port ?? 1234,
    hostname: "localhost",
    resources: [Resource1],
    services: [new ServerService()],
  });
}

Deno.test(
  'Server before services should have "end lifecycle" contexts separated',
  async () => {
    const server = getServer(1667);
    server.run();

    // Make the first request. This request will end early, but it also has a
    // timeout set at 5 seconds. The second request below this code will also end
    // early, but should not know this this first request is also ending early.
    // They should have two completely different contexts.
    const p = new Promise((resolve) => {
      fetch(`${server.address}?server-before=wait`)
        .then(async (res) => {
          resolve(await res.text());
        });
    });

    // This request will end early as well, but it has a different context. So
    // even though the first request is ending early, the first request's "end
    // early" context should have no effect on the request below.
    const res = await fetch(`${server.address}?server-before=throw`);
    assertEquals(res.headers.get("x-server-service-before"), "started");
    assertEquals(res.headers.get("x-server-service-after"), null);
    assertEquals(res.headers.get("x-class-service-before"), null);
    assertEquals(res.headers.get("x-class-service-after"), null);
    assertEquals(res.headers.get("x-method-service-before"), null);
    assertEquals(res.headers.get("x-method-service-after"), null);
    assertEquals(res.headers.get("x-resource-called"), null);
    assertEquals(res.status, 419);
    assertEquals(
      (await res.text()).startsWith("Error: Server Service Before threw"),
      true,
    );

    // Await on the first request to resolve so that we do not leak ops.
    await p;

    await server.close();
  }
);

Deno.test("Server before services should throw and end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?server-before=throw`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "started");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), null);
  assertEquals(res.headers.get("x-class-service-after"), null);
  assertEquals(res.headers.get("x-method-service-before"), null);
  assertEquals(res.headers.get("x-method-service-after"), null);
  assertEquals(res.headers.get("x-resource-called"), null);
  assertEquals(res.status, 419);
  assertEquals(
    (await res.text()).startsWith("Error: Server Service Before threw"),
    true,
  );
});

Deno.test("Server before services should end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?server-before=end`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "started");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), null);
  assertEquals(res.headers.get("x-class-service-after"), null);
  assertEquals(res.headers.get("x-method-service-before"), null);
  assertEquals(res.headers.get("x-method-service-after"), null);
  assertEquals(res.headers.get("x-resource-called"), null);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "server before ended");
});

Deno.test("Server after services should throw and end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?server-after=throw`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), "started");
  assertEquals(res.headers.get("x-class-service-before"), "finished");
  assertEquals(res.headers.get("x-class-service-after"), "finished");
  assertEquals(res.headers.get("x-method-service-before"), "finished");
  assertEquals(res.headers.get("x-method-service-after"), "finished");
  assertEquals(res.headers.get("x-resource-called"), "true");
  assertEquals(res.status, 419);
  assertEquals(
    (await res.text()).startsWith("Error: Server Service After threw"),
    true,
  );
});

Deno.test("Server after services should end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?server-after=end`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), "started");
  assertEquals(res.headers.get("x-class-service-before"), "finished");
  assertEquals(res.headers.get("x-class-service-after"), "finished");
  assertEquals(res.headers.get("x-method-service-before"), "finished");
  assertEquals(res.headers.get("x-method-service-after"), "finished");
  assertEquals(res.headers.get("x-resource-called"), "true");
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "server after ended");
});

Deno.test(
  'Class before services should have "end lifecycle" contexts separated',
  async () => {
    const server = getServer(1667);
    server.run();

    // Make the first request. This request will end early, but it also has a
    // timeout set at 5 seconds. The second request below this code will also end
    // early, but should not know this this first request is also ending early.
    // They should have two completely different contexts.
    const p = new Promise((resolve) => {
      fetch(`${server.address}?server-before=wait`)
        .then(async (res) => {
          resolve(await res.text());
        });
    });

    // This request will end early as well, but it has a different context. So
    // even though the first request is ending early, the first request's "end
    // early" context should have no effect on the request below.
    const res = await fetch(`${server.address}?class-before=throw`);
    assertEquals(res.headers.get("x-server-service-before"), "finished");
    assertEquals(res.headers.get("x-server-service-after"), null);
    assertEquals(res.headers.get("x-class-service-before"), "started");
    assertEquals(res.headers.get("x-class-service-after"), null);
    assertEquals(res.headers.get("x-method-service-before"), null);
    assertEquals(res.headers.get("x-method-service-after"), null);
    assertEquals(res.headers.get("x-resource-called"), null);
    assertEquals(res.status, 419);
    assertEquals(
      (await res.text()).startsWith("Error: Class Service Before threw"),
      true,
    );

    // Await on the first request to resolve so that we do not leak ops.
    await p;

    await server.close();
  }
);

Deno.test("Class before services should throw and end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?class-before=throw`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), "started");
  assertEquals(res.headers.get("x-class-service-after"), null);
  assertEquals(res.headers.get("x-method-service-before"), null);
  assertEquals(res.headers.get("x-method-service-after"), null);
  assertEquals(res.headers.get("x-resource-called"), null);
  assertEquals(res.status, 419);
  assertEquals(
    (await res.text()).startsWith("Error: Class Service Before threw"),
    true,
  );
});

Deno.test("Class before services should end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?class-before=end`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), "started");
  assertEquals(res.headers.get("x-class-service-after"), null);
  assertEquals(res.headers.get("x-method-service-before"), null);
  assertEquals(res.headers.get("x-method-service-after"), null);
  assertEquals(res.headers.get("x-resource-called"), null);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "class before ended");
});

Deno.test("Class after services should throw and end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?class-after=throw`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), "finished");
  assertEquals(res.headers.get("x-class-service-after"), "started");
  assertEquals(res.headers.get("x-method-service-before"), "finished");
  assertEquals(res.headers.get("x-method-service-after"), "finished");
  assertEquals(res.headers.get("x-resource-called"), "true");
  assertEquals(res.status, 419);
  assertEquals(
    (await res.text()).startsWith("Error: Class Service After threw"),
    true,
  );
});

Deno.test("Class after services should end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?class-after=end`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), "finished");
  assertEquals(res.headers.get("x-class-service-after"), "started");
  assertEquals(res.headers.get("x-method-service-before"), "finished");
  assertEquals(res.headers.get("x-method-service-after"), "finished");
  assertEquals(res.headers.get("x-resource-called"), "true");
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "class after ended");
});

Deno.test(
  'Method before services should have "end lifecycle" contexts separated',
  async () => {
    const server = getServer(1887);
    server.run();

    // Make the first request. This request will end early, but it also has a
    // timeout set at 5 seconds. The second request below this code will also end
    // early, but should not know this this first request is also ending early.
    // They should have two completely different contexts.
    const p = new Promise((resolve) => {
      fetch(`${server.address}?method-before=wait`)
        .then(async (res) => {
          resolve(await res.text());
        });
    });

    const res = await fetch(`${server.address}?method-before=throw`);
    assertEquals(res.headers.get("x-server-service-before"), "finished");
    assertEquals(res.headers.get("x-server-service-after"), null);
    assertEquals(res.headers.get("x-class-service-before"), "finished");
    assertEquals(res.headers.get("x-class-service-after"), null);
    assertEquals(res.headers.get("x-method-service-before"), "started");
    assertEquals(res.headers.get("x-method-service-after"), null);
    assertEquals(res.headers.get("x-resource-called"), null);
    assertEquals(res.status, 419);
    assertEquals(
      (await res.text()).startsWith("Error: Method Service Before threw"),
      true,
    );

    // Await on the first request to resolve so that we do not leak ops.
    await p;

    await server.close();
  }
);

Deno.test("Method before services should throw and end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?method-before=throw`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), "finished");
  assertEquals(res.headers.get("x-class-service-after"), null);
  assertEquals(res.headers.get("x-method-service-before"), "started");
  assertEquals(res.headers.get("x-method-service-after"), null);
  assertEquals(res.headers.get("x-resource-called"), null);
  assertEquals(res.status, 419);
  assertEquals(
    (await res.text()).startsWith("Error: Method Service Before threw"),
    true,
  );
});

Deno.test("Method before services should end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?method-before=end`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), "finished");
  assertEquals(res.headers.get("x-class-service-after"), null);
  assertEquals(res.headers.get("x-method-service-before"), "started");
  assertEquals(res.headers.get("x-method-service-after"), null);
  assertEquals(res.headers.get("x-resource-called"), null);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "method before ended");
});

Deno.test("Method after services should throw and end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?method-after=throw`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), "finished");
  assertEquals(res.headers.get("x-class-service-after"), null);
  assertEquals(res.headers.get("x-method-service-before"), "finished");
  assertEquals(res.headers.get("x-method-service-after"), "started");
  assertEquals(res.headers.get("x-resource-called"), "true");
  assertEquals(res.status, 419);
  assertEquals(
    (await res.text()).startsWith("Error: Method Service After threw"),
    true,
  );
});

Deno.test("Method after services should end lifecycle", async () => {
  const server = getServer();
  server.run();
  const res = await fetch(`${server.address}?method-after=end`);
  await server.close();
  assertEquals(res.headers.get("x-server-service-before"), "finished");
  assertEquals(res.headers.get("x-server-service-after"), null);
  assertEquals(res.headers.get("x-class-service-before"), "finished");
  assertEquals(res.headers.get("x-class-service-after"), null);
  assertEquals(res.headers.get("x-method-service-before"), "finished");
  assertEquals(res.headers.get("x-method-service-after"), "started");
  assertEquals(res.headers.get("x-resource-called"), "true");
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "method after ended");
});
