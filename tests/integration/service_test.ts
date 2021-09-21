import { IContext, IService, Resource, Server, Service } from "../../mod.ts";
import { assertEquals } from "../deps.ts";

class ServerService extends Service implements IService {
  runBeforeResource(context: IContext) {
    context.response.headers.set("X-SERVER-SERVICE-BEFORE", "hi");
  }
  runAfterResource(context: IContext) {
    context.response.headers.set("X-SERVER-SERVICE-AFTER", "hi");
  }
}

const serverService = new ServerService();

class ClassService extends Service implements IService {
  runBeforeResource(context: IContext) {
    context.response.headers.set("X-CLASS-SERVICE-BEFORE", "hi");
  }
  runAfterResource(context: IContext) {
    context.response.headers.set("X-CLASS-SERVICE-AFTER", "hi");
  }
}

const classService = new ClassService();

class MethodService implements IService {
  runBeforeResource(context: IContext) {
    context.response.headers.set("X-METHOD-SERVICE-BEFORE", "hi");
  }
  runAfterResource(context: IContext) {
    context.response.headers.set("X-METHOD-SERVICE-AFTER", "hi");
  }
}

// TODO :: Make paths not static, no need for it to be static anymore right?

const methodService = new MethodService();

class Resource1 extends Resource {
  paths = ["/"];

  public services = {
    "ALL": [classService],
    "GET": [methodService],
  };

  public GET(context: IContext) {
    context.response.body = "done";
  }
}

const server = new Server({
  protocol: "http",
  port: 1234,
  hostname: "localhost",
  resources: [Resource1],
  services: [serverService],
});

Deno.test("Class middleware should run", async () => {
  server.run();
  const res = await fetch(server.address);
  await res.text();
  server.close();
  assertEquals(res.headers.get("X-CLASS-SERVICE-BEFORE"), "hi");
  assertEquals(res.headers.get("X-CLASS-SERVICE-AFTER"), "hi");
});

Deno.test("Method middleware should run", async () => {
  server.run();
  const res = await fetch(server.address);
  await res.text();
  server.close();
  assertEquals(res.headers.get("X-METHOD-SERVICE-BEFORE"), "hi");
  assertEquals(res.headers.get("X-METHOD-SERVICE-AFTER"), "hi");
});

Deno.test("Server middleware should run", async () => {
  server.run();
  const res = await fetch(server.address);
  await res.text();
  server.close();
  assertEquals(res.headers.get("X-SERVER-SERVICE-BEFORE"), "hi");
  assertEquals(res.headers.get("X-SERVER-SERVICE-AFTER"), "hi");
});