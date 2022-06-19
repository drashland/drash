import { assertEquals, TestHelpers } from "../deps.ts";
import type { ConnInfo } from "../../deps.ts";
import { ErrorHandler, Errors, Response, Server } from "../../mod.ts";

class MyErrorHandler extends ErrorHandler {
  public catch(error: Error, _request: Request, response: Response) {
    let code = 0;
    if (error instanceof Errors.HttpError) {
      code = error.code;
    } else {
      code = 500;
    }
    response.json({ error: error.message }, code);
  }
}

class MyHttpErrorErrorHandler extends ErrorHandler {
  public catch(_error: Error, _request: Request, _response: Response) {
    throw new Errors.HttpError(500, "error on ErrorHandler");
  }
}

class MyOwnErrorHandler {
  public catch(error: Error, _request: Request, response: Response) {
    let code = 0;
    if (error instanceof Errors.HttpError) {
      code = error.code;
    } else {
      code = 500;
    }
    response.json({ error: error.message }, code);
  }
}

class MyAsyncErrorHandler extends ErrorHandler {
  public async catch(error: Error, _request: Request, response: Response) {
    let code = 0;
    if (error instanceof Errors.HttpError) {
      code = error.code;
    } else {
      code = 500;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    response.json({ error: error.message }, code);
  }
}

class MySimpleErrorErrorHandler {
  public catch(_error: Error, _request: Request, _response: Response) {
    throw new Error("My Simple Error");
  }
}

class MyConnInfoErrorErrorHandler {
  public catch(
    _error: Error,
    _request: Request,
    response: Response,
    connInfo: ConnInfo,
  ) {
    return response.json(connInfo);
  }
}

Deno.test("error_handler_test.ts", async (t) => {
  await t.step("GET /", async (t) => {
    await t.step("default ErrorHandler", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 404);
      assertEquals(
        (await res.text()).includes("Error: Not Found\n"),
        true,
      );
    });

    await t.step("custom ErrorHandler", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MyErrorHandler,
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 404);
      assertEquals(await res.json(), { error: "Not Found" });
    });

    await t.step("custom ErrorHandler thrown error", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MyHttpErrorErrorHandler,
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 500);
      assertEquals(
        (await res.text()).includes("Error: error on ErrorHandler\n"),
        true,
      );
    });

    await t.step("custom ErrorHandler without extends", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MyOwnErrorHandler,
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 404);
      assertEquals(await res.json(), { error: "Not Found" });
    });

    await t.step("custom ErrorHandler with async catch", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MyAsyncErrorHandler,
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 404);
      assertEquals(await res.json(), { error: "Not Found" });
    });

    await t.step("custom ErrorHandler simple Error thrown", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MySimpleErrorErrorHandler,
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      assertEquals(res.status, 500);
      assertEquals(
        (await res.text()).includes("Error: My Simple Error\n"),
        true,
      );
    });

    await t.step("connInfo error handler gets connInfo", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
        error_handler: MyConnInfoErrorErrorHandler,
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();
      const json = await res.json();
      assertEquals(res.status, 200);
      assertEquals(json.localAddr.port, 3000);
      assertEquals(json.remoteAddr.transport, "tcp");
    });
  });
});
