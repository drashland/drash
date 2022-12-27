import { assertEquals, Drash, TestHelpers } from "../../deps.ts";

// FILE MARKER - APP SETUP /////////////////////////////////////////////////////

class MethodService implements Drash.Interfaces.Service {
  async runBeforeResource(request: Drash.Request, response: Drash.Response) {
    response.headers({ "x-method-service-before": "started" });

    const action = request.queryParam("action");

    if (!action) {
      return;
    }

    if (action === "method-service-before-wait") {
      request.end();
      const p = new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
      await p;
      return;
    }

    if (action === "method-service-before-throw") {
      throw new Drash.HTTPError(418, "Method Service Before threw");
    }

    if (action === "method-service-before-end") {
      response.text("method before ended");
      return request.end();
    }

    response.headers({ "x-method-service-before": "finished" });
  }

  runAfterResource(request: Drash.Request, response: Drash.Response) {
    response.headers({ "x-method-service-after": "started" });

    const action = request.queryParam("action");

    if (!action) {
      return;
    }

    if (action === "method-service-after-throw") {
      throw new Drash.HTTPError(418, "Method Service After threw");
    }

    if (action === "method-service-after-end") {
      response.text("method after ended");
      return request.end();
    }

    response.headers({ "x-method-service-after": "finished" });
  }
}

class ServerService implements Drash.Interfaces.Service {
  async runBeforeResource(request: Drash.Request, response: Drash.Response) {
    response.headers({ "x-server-service-before": "started" });

    const action = request.queryParam("action");

    if (!action) {
      return;
    }

    if (action === "server-service-before-wait") {
      const p = new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
      await p;
      return request.end();
    }

    if (action === "server-service-before-throw") {
      throw new Drash.HTTPError(418, "Server Service Before threw");
    }

    if (action === "server-service-before-end") {
      response.text("server before ended");
      return request.end();
    }

    response.headers({ "x-server-service-before": "finished" });
  }

  runAfterResource(request: Drash.Request, response: Drash.Response) {
    response.headers({ "x-server-service-after": "started" });

    const action = request.queryParam("action");

    if (!action) {
      return;
    }

    if (action === "server-service-after-throw") {
      throw new Drash.HTTPError(418, "Server Service After threw");
    }

    if (action === "server-service-after-end") {
      response.text("server after ended");
      return request.end();
    }

    response.headers({ "x-server-service-after": "finished" });
  }
}

class ClassService implements Drash.Interfaces.Service {
  async runBeforeResource(request: Drash.Request, response: Drash.Response) {
    response.headers({ "x-class-service-before": "started" });

    const action = request.queryParam("action");

    if (!action) {
      return;
    }

    if (action === "class-service-before-wait") {
      request.end();
      const p = new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
      await p;
      return response;
    }

    if (action === "class-service-before-throw") {
      throw new Drash.HTTPError(418, "Class Service Before threw");
    }

    if (action === "class-service-before-end") {
      response.text("class before ended");
      return request.end();
    }

    response.headers({ "x-class-service-before": "finished" });
  }

  runAfterResource(request: Drash.Request, response: Drash.Response) {
    response.headers({ "x-class-service-after": "started" });

    const action = request.queryParam("action");

    if (!action) {
      return;
    }

    if (action === "class-service-after-throw") {
      throw new Drash.HTTPError(418, "Class Service After threw");
    }

    if (action === "class-service-after-end") {
      response.text("class after ended");
      return request.end();
    }

    response.headers({ "x-class-service-after": "finished" });
  }
}

class Resource1 extends Drash.Resource {
  paths = ["/"];

  public services = {
    ALL: [new ClassService()],
    GET: [new MethodService()],
  };

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.text("GET called").headers({ "x-resource-called": "true" });
  }
}

async function runServer(port?: number): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [
      Resource1,
    ],
    services: [new ServerService()],
  });

  const denoRequestHandler = (request: Request) => {
    return NativeRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(port ?? 1234)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

// FILE MARKER - TESTS /////////////////////////////////////////////////////////

Deno.test("NativeRequest / .end()", async (t) => {
  await t.step(
    `Server before services should thow and end lifecycle`,
    async () => {
      const server = await runServer();

      const res = await fetch(
        `${server.address}?action=server-service-before-throw`,
      );
      await server.close();
      assertEquals(res.headers.get("x-server-service-before"), "started");
      assertEquals(res.headers.get("x-server-service-after"), null);
      assertEquals(res.headers.get("x-class-service-before"), null);
      assertEquals(res.headers.get("x-class-service-after"), null);
      assertEquals(res.headers.get("x-method-service-before"), null);
      assertEquals(res.headers.get("x-method-service-after"), null);
      assertEquals(res.headers.get("x-resource-called"), null);
      assertEquals(res.status, 418);
      assertEquals(
        (await res.text()).startsWith("Error: Server Service Before threw"),
        true,
      );
    },
  );

  await t.step("Server before services should end lifecycle", async () => {
    const server = await runServer();

    const res = await fetch(
      `${server.address}?action=server-service-before-end`,
    );
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

  await t.step(
    "Server after services should throw and end lifecycle",
    async () => {
      const server = await runServer();

      const res = await fetch(
        `${server.address}?action=server-service-after-throw`,
      );

      await server.close();
      assertEquals(res.headers.get("x-server-service-before"), "finished");
      assertEquals(res.headers.get("x-server-service-after"), "started");
      assertEquals(res.headers.get("x-class-service-before"), "finished");
      assertEquals(res.headers.get("x-class-service-after"), "finished");
      assertEquals(res.headers.get("x-method-service-before"), "finished");
      assertEquals(res.headers.get("x-method-service-after"), "finished");
      assertEquals(res.headers.get("x-resource-called"), "true");
      assertEquals(res.status, 418);
      assertEquals(
        (await res.text()).startsWith("Error: Server Service After threw"),
        true,
      );
    },
  );

  await t.step("Server after services should end lifecycle", async () => {
    const server = await runServer();

    const res = await fetch(
      `${server.address}?action=server-service-after-end`,
    );
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

  await t.step(
    'Class before services should have "end lifecycle" contexts separated',
    async () => {
      const server = await runServer(1667);

      // Make the first request. This request will end early, but it also has a
      // timeout set at 5 seconds. The second request below this code will also end
      // early, but should not know this this first request is also ending early.
      // They should have two completely different contexts.
      const p = new Promise((resolve) => {
        fetch(`${server.address}?action=server-service-before-wait`)
          .then(async (res) => {
            resolve(await res.text());
          });
      });

      // This request will end early as well, but it has a different context. So
      // even though the first request is ending early, the first request's "end
      // early" context should have no effect on the request below.
      const res = await fetch(
        `${server.address}?action=class-service-before-throw`,
      );
      assertEquals(res.headers.get("x-server-service-before"), "finished");
      assertEquals(res.headers.get("x-server-service-after"), null);
      assertEquals(res.headers.get("x-class-service-before"), "started");
      assertEquals(res.headers.get("x-class-service-after"), null);
      assertEquals(res.headers.get("x-method-service-before"), null);
      assertEquals(res.headers.get("x-method-service-after"), null);
      assertEquals(res.headers.get("x-resource-called"), null);
      assertEquals(res.status, 418);
      assertEquals(
        (await res.text()).startsWith("Error: Class Service Before threw"),
        true,
      );

      // Await on the first request to resolve so that we do not leak ops.
      await p;

      await server.close();
    },
  );

  await t.step(
    "Class before services should throw and end lifecycle",
    async () => {
      const server = await runServer();

      const res = await fetch(
        `${server.address}?action=class-service-before-throw`,
      );
      await server.close();
      assertEquals(res.headers.get("x-server-service-before"), "finished");
      assertEquals(res.headers.get("x-server-service-after"), null);
      assertEquals(res.headers.get("x-class-service-before"), "started");
      assertEquals(res.headers.get("x-class-service-after"), null);
      assertEquals(res.headers.get("x-method-service-before"), null);
      assertEquals(res.headers.get("x-method-service-after"), null);
      assertEquals(res.headers.get("x-resource-called"), null);
      assertEquals(res.status, 418);
      assertEquals(
        (await res.text()).startsWith("Error: Class Service Before threw"),
        true,
      );
    },
  );

  await t.step("Class before services should end lifecycle", async () => {
    const server = await runServer();

    const res = await fetch(
      `${server.address}?action=class-service-before-end`,
    );
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

  await t.step(
    "Class after services should throw and end lifecycle",
    async () => {
      const server = await runServer();

      const res = await fetch(
        `${server.address}?action=class-service-after-throw`,
      );
      await server.close();
      assertEquals(res.headers.get("x-server-service-before"), "finished");
      assertEquals(res.headers.get("x-server-service-after"), null);
      assertEquals(res.headers.get("x-class-service-before"), "finished");
      assertEquals(res.headers.get("x-class-service-after"), "started");
      assertEquals(res.headers.get("x-method-service-before"), "finished");
      assertEquals(res.headers.get("x-method-service-after"), "finished");
      assertEquals(res.headers.get("x-resource-called"), "true");
      assertEquals(res.status, 418);
      assertEquals(
        (await res.text()).startsWith("Error: Class Service After threw"),
        true,
      );
    },
  );

  await t.step("Class after services should end lifecycle", async () => {
    const server = await runServer();

    const res = await fetch(`${server.address}?action=class-service-after-end`);
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

  await t.step(
    'Method before services should have "end lifecycle" contexts separated',
    async () => {
      const server = await runServer(1887);

      // Make the first request. This request will end early, but it also has a
      // timeout set at 5 seconds. The second request below this code will also end
      // early, but should not know this this first request is also ending early.
      // They should have two completely different contexts.
      const p = new Promise((resolve) => {
        fetch(`${server.address}?action=method-service-before-wait`)
          .then(async (res) => {
            resolve(await res.text());
          });
      });

      const res = await fetch(
        `${server.address}?action=method-service-before-throw`,
      );
      assertEquals(res.headers.get("x-server-service-before"), "finished");
      assertEquals(res.headers.get("x-server-service-after"), null);
      assertEquals(res.headers.get("x-class-service-before"), "finished");
      assertEquals(res.headers.get("x-class-service-after"), null);
      assertEquals(res.headers.get("x-method-service-before"), "started");
      assertEquals(res.headers.get("x-method-service-after"), null);
      assertEquals(res.headers.get("x-resource-called"), null);
      assertEquals(res.status, 418);
      assertEquals(
        (await res.text()).startsWith("Error: Method Service Before threw"),
        true,
      );

      // Await on the first request to resolve so that we do not leak ops.
      await p;

      await server.close();
    },
  );

  await t.step(
    "Method before services should throw and end lifecycle",
    async () => {
      const server = await runServer();

      const res = await fetch(
        `${server.address}?action=method-service-before-throw`,
      );
      await server.close();
      assertEquals(res.headers.get("x-server-service-before"), "finished");
      assertEquals(res.headers.get("x-server-service-after"), null);
      assertEquals(res.headers.get("x-class-service-before"), "finished");
      assertEquals(res.headers.get("x-class-service-after"), null);
      assertEquals(res.headers.get("x-method-service-before"), "started");
      assertEquals(res.headers.get("x-method-service-after"), null);
      assertEquals(res.headers.get("x-resource-called"), null);
      assertEquals(res.status, 418);
      assertEquals(
        (await res.text()).startsWith("Error: Method Service Before threw"),
        true,
      );
    },
  );

  await t.step("Method before services should end lifecycle", async () => {
    const server = await runServer();

    const res = await fetch(
      `${server.address}?action=method-service-before-end`,
    );
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

  await t.step(
    "Method after services should throw and end lifecycle",
    async () => {
      const server = await runServer();

      const res = await fetch(
        `${server.address}?action=method-service-after-throw`,
      );
      await server.close();
      assertEquals(res.headers.get("x-server-service-before"), "finished");
      assertEquals(res.headers.get("x-server-service-after"), null);
      assertEquals(res.headers.get("x-class-service-before"), "finished");
      assertEquals(res.headers.get("x-class-service-after"), null);
      assertEquals(res.headers.get("x-method-service-before"), "finished");
      assertEquals(res.headers.get("x-method-service-after"), "started");
      assertEquals(res.headers.get("x-resource-called"), "true");
      assertEquals(res.status, 418);
      assertEquals(
        (await res.text()).startsWith("Error: Method Service After threw"),
        true,
      );
    },
  );

  await t.step("Method after services should end lifecycle", async () => {
    const server = await runServer();

    const res = await fetch(
      `${server.address}?action=method-service-after-end`,
    );
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

  await t.step(
    `Server before services should have "end lifecycle" contexts separated`,
    async (t) => {
      await t.step("Should set the response time header", async () => {
        const server = await runServer(1667);

        // Make the first request. This request will end early, but it also has a
        // timeout set at 5 seconds. The second request below this code will also end
        // early, but should not know that this first request is also ending early.
        // They should have two completely different contexts.
        const p = new Promise((resolve) => {
          resolve(fetch(`${server.address}?action=server-service-before-wait`));
        });

        // This request will end early as well, but it has a different context. So
        // even though the first request is ending early, the first request's "end
        // early" context should have no effect on the request below.
        //
        // The expected behavior is that this request ends before the one above.
        const res = await fetch(
          `${server.address}?action=server-service-before-throw`,
        );

        assertEquals(res.headers.get("x-server-service-before"), "started");
        assertEquals(res.headers.get("x-server-service-after"), null);
        assertEquals(res.headers.get("x-class-service-before"), null);
        assertEquals(res.headers.get("x-class-service-after"), null);
        assertEquals(res.headers.get("x-method-service-before"), null);
        assertEquals(res.headers.get("x-method-service-after"), null);
        assertEquals(res.headers.get("x-resource-called"), null);
        assertEquals(res.status, 418);
        assertEquals(
          (await res.text()).includes("Server Service Before threw"),
          true,
        );

        // Await on the first request to resolve so that we do not leak ops.
        const firstReqRes = await p as Response;

        assertEquals(
          firstReqRes.headers.get("x-server-service-before"),
          "started",
        );
        assertEquals(firstReqRes.headers.get("x-server-service-after"), null);
        assertEquals(firstReqRes.headers.get("x-class-service-before"), null);
        assertEquals(firstReqRes.headers.get("x-class-service-after"), null);
        assertEquals(firstReqRes.headers.get("x-method-service-before"), null);
        assertEquals(firstReqRes.headers.get("x-method-service-after"), null);
        assertEquals(firstReqRes.headers.get("x-resource-called"), null);
        assertEquals(firstReqRes.status, 200);
        assertEquals(
          (await firstReqRes.text()).includes("Server Service Before threw"),
          false,
        );

        await server.close();
      });
    },
  );
});
