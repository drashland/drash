import {
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
  runBeforeResource(_request: Request, response: Response) {
    response.text("hi");
    this.end();
  }
}

const methodService = new MethodService();

class Resource1 extends Resource implements IResource {
  paths = ["/"];

  public services = {
    "GET": [methodService],
  };

  public GET(_request: Request, response: Response) {
    response.text("goodbye");
  }
}

const server = new Server({
  protocol: "http",
  port: 1234,
  hostname: "localhost",
  resources: [Resource1],
});

Deno.test("Class middleware should run", async () => {
  server.run();
  const res = await fetch(server.address, {
    headers: {
      Accept: "text/plain",
    },
  });
  await server.close();
  assertEquals(await res.text(), "hi");
});
