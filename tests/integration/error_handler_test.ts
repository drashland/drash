import { Rhum, TestHelpers } from "../deps.ts";
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

Rhum.testPlan("error_handler_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("default ErrorHandler", async () => {
      const server = new Server({
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        resources: [],
      });
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      Rhum.asserts.assertEquals(res.status, 404);
      Rhum.asserts.assertEquals(
        (await res.text()).includes("Error: Not Found\n"),
        true,
      );
    });

    Rhum.testCase("custom ErrorHandler", async () => {
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

      Rhum.asserts.assertEquals(res.status, 404);
      Rhum.asserts.assertEquals(await res.json(), { error: "Not Found" });
    });

    Rhum.testCase("custom ErrorHandler thrown error", async () => {
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

      Rhum.asserts.assertEquals(res.status, 500);
      Rhum.asserts.assertEquals(
        (await res.text()).includes("Error: error on ErrorHandler\n"),
        true,
      );
    });

    Rhum.testCase("custom ErrorHandler without extends", async () => {
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

      Rhum.asserts.assertEquals(res.status, 404);
      Rhum.asserts.assertEquals(await res.json(), { error: "Not Found" });
    });

    Rhum.testCase("custom ErrorHandler with async catch", async () => {
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

      Rhum.asserts.assertEquals(res.status, 404);
      Rhum.asserts.assertEquals(await res.json(), { error: "Not Found" });
    });

    Rhum.testCase("custom ErrorHandler simple Error thrown", async () => {
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

      Rhum.asserts.assertEquals(res.status, 500);
      Rhum.asserts.assertEquals(
        (await res.text()).includes("Error: My Simple Error\n"),
        true,
      );
    });
  });
});

Rhum.run();
