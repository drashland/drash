import { assertEquals, ConnInfo, Drash, TestHelpers } from "../../deps.ts";

// FILE MARKER - APP SETUP /////////////////////////////////////////////////////

class MyErrorHandler extends Drash.ErrorHandler {
  public handle(context: Drash.Types.ErrorHandlerContext) {
    let code = 0;
    if (context.error instanceof Drash.HTTPError) {
      code = context.error?.code;
    } else {
      code = 500;
    }

    return TestHelpers.responseBuilder().json({ error: context.error?.message })
      .status(
        code,
      ).build();
  }
}

class MyHTTPErrorErrorHandler extends Drash.ErrorHandler {
  public handle(_context: Drash.Types.ErrorHandlerContext) {
    throw new Drash.HTTPError(500, "error on ErrorHandler");
  }
}

class MyOwnErrorHandler {
  public handle(context: Drash.Types.ErrorHandlerContext) {
    let code = 0;
    if (context.error instanceof Drash.HTTPError) {
      code = context.error?.code;
    } else {
      code = 500;
    }
    return TestHelpers.responseBuilder().json({ error: context.error?.message })
      .status(code).build();
  }
}

class MyAsyncErrorHandler extends Drash.ErrorHandler {
  public async handle(context: Drash.Types.ErrorHandlerContext) {
    let code = 0;
    if (context.error instanceof Drash.HTTPError) {
      code = context.error?.code;
    } else {
      code = 500;
    }
    // We should see a pause
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return TestHelpers.responseBuilder().json({ error: context.error?.message })
      .status(code).build();
  }
}

class MySimpleErrorErrorHandler {
  public handle(_context: Drash.Types.ErrorHandlerContext) {
    throw new Error("My Simple Error");
  }
}

class _TypeCheckConnInfoInErrorHandler {
  public handle(context: Drash.Types.ErrorHandlerContext) {
    return TestHelpers.responseBuilder().json({
      thrown_error: context.error,
    }).build();
  }
}

class MyConnInfoErrorErrorHandler implements Drash.Interfaces.ErrorHandler {
  public handle(context: Drash.Types.ErrorHandlerContext) {
    return TestHelpers.responseBuilder().json({
      conn_info: {
        local_addr: JSON.parse(
          context.request.headers.get("x-deno-conn-info-local-addr") ?? "{}",
        ),
        remote_addr: JSON.parse(
          context.request.headers.get("x-deno-conn-info-remote-addr") ?? "{}",
        ),
      },
      thrown_error: context.error,
    }).build();
  }
}

async function runServer(
  errorHandler?: Drash.Types.ErrorHandlerClass,
  resources?: Drash.Types.ResourceClass[],
): Promise<TestHelpers.DrashServer> {
  const requestHandlerOptions: {
    error_handler?: Drash.Types.ErrorHandlerClass;
    resources?: Drash.Types.ResourceClass[];
  } = {};
  if (errorHandler) {
    requestHandlerOptions.error_handler = errorHandler;
  }
  if (resources) {
    requestHandlerOptions.resources = resources;
  }

  const NativeRequestHandler = await Drash.createRequestHandler(
    requestHandlerOptions,
  );

  // Create a Deno-specific Request object to handle setting the ConnInfo data
  // in the request headers
  class DenoRequestWithConnInfo extends Request {
    readonly headers: Headers;
    constructor(request: Request) {
      super(request);
      this.headers = super.headers;
    }

    public setConnInfo(connInfo: ConnInfo): void {
      this.headers.append(
        "x-deno-conn-info-local-addr",
        JSON.stringify(connInfo.localAddr),
      );
      this.headers.append(
        "x-deno-conn-info-remote-addr",
        JSON.stringify(connInfo.remoteAddr),
      );
    }
  }

  const denoRequestHandler = (request: Request, connInfo: ConnInfo) => {
    const denoRequestWithConnInfo = new DenoRequestWithConnInfo(request);
    denoRequestWithConnInfo.setConnInfo(connInfo);
    return NativeRequestHandler.handle(denoRequestWithConnInfo);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(3000)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

// FILE MARKER - TESTS /////////////////////////////////////////////////////////

Deno.test("error_handler_test.ts", async (t) => {
  await t.step("GET /", async (t) => {
    await t.step("default ErrorHandler", async () => {
      const server = await runServer();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 404);
      assertEquals(
        (await res.text()).includes("Error: Not Found\n"),
        true,
      );
    });

    await t.step("custom ErrorHandler", async () => {
      const server = await runServer(MyErrorHandler);
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 404);
      assertEquals(await res.json(), { error: "Not Found" });
    });

    await t.step("custom ErrorHandler thrown error", async () => {
      const server = await runServer(MyHTTPErrorErrorHandler);
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      const text = await res.text();

      assertEquals(res.status, 500);
      assertEquals(
        (text).includes("error on ErrorHandler"),
        true,
      );
    });

    await t.step("custom ErrorHandler without extends", async () => {
      const server = await runServer(MyOwnErrorHandler);
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 404);
      assertEquals(await res.json(), { error: "Not Found" });
    });

    await t.step("custom ErrorHandler with async handle()", async () => {
      const server = await runServer(MyAsyncErrorHandler);
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 404);
      assertEquals(await res.json(), { error: "Not Found" });
    });

    await t.step("custom ErrorHandler simple Error thrown", async () => {
      const server = await runServer(MySimpleErrorErrorHandler);
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 500);
      assertEquals(
        (await res.text()).includes("My Simple Error\n"),
        true,
      );
    });

    await t.step("connInfo error handler gets connInfo", async () => {
      const server = await runServer(MyConnInfoErrorErrorHandler);
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();
      const json = await res.json();
      assertEquals(res.status, 200);
      assertEquals(json.conn_info.local_addr.transport, "tcp");
      assertEquals(json.conn_info.remote_addr.transport, "tcp");
    });
  });
});
