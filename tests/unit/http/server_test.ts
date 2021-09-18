import { Rhum } from "../../deps.ts";
import { Server } from "../../../src/http/server.ts"
import { DrashResource } from "../../../src/http/resource.ts"
import { assertThrowsAsync } from "../../deps.ts"

Rhum.testPlan("http/server_test.ts", () => {

  Rhum.testSuite("address", () => {
    Rhum.testCase("Should correctly format the address", () => {
      const server1 = new Server({ protocol: "https", hostname: "hosty" ,port: 1234, resources: [HomeResource] })
      const server2 = new Server({ port: 1234, resources: [HomeResource], protocol: "http" })
      Rhum.asserts.assertEquals(server1.address, "https://hosty:1234")
      Rhum.asserts.assertEquals(server2.address, "http://localhost:1234")
    })
  })

  Rhum.testSuite("close()", () => {
    Rhum.testCase("Closes the server", async () => {
      const server = new Server({ port: 1234, resources: [HomeResource], protocol: "http" });
      await server.run();
      await Deno.connect({
        hostname: "localhost",
        port: 1234
      })
      server.close();
      assertThrowsAsync(async () => {await Deno.connect({
        hostname: "localhost",
        port: 1234
      })})
    });
  });

  Rhum.testSuite("run()", () => {
    Rhum.testCase("Will listen correctly and send the proper response", async () => {
      const server = new Server({
        port: 1234,
        protocol: "http",
        resources: [HomeResource]
      })
      await server.run()
      const res = await fetch("http://localhost:1234")
      Rhum.asserts.assertEquals(await res.json(),
        {
          success: true
        }
      )
      Rhum.asserts.assertEquals(res.status, 200)
    })
    Rhum.testCase("Will throw a 404 if no resource found matching the uri", async () => {
      const server = new Server({
        port: 1234,
        protocol: "http",
        resources: [HomeResource]
      })
      await server.run()
      const res = await fetch("http://localhost:1234/dont/exist")
      Rhum.asserts.assertEquals(res.status, 404)
    })
    Rhum.testCase("Will throw a 405 if the req method isnt found on the resource", async () => {
      const server = new Server({
        port: 1234,
        protocol: "http",
        resources: [HomeResource]
      })
      await server.run()
      const res = await fetch("http://localhost:1234", {
        method: "OPTIONS"
      })
      Rhum.asserts.assertEquals(res.status, 405)
    })
    Rhum.testCase("Will parse the body if it exists on the request", async () => {
      const server = new Server({
        port: 1234,
        protocol: "http",
        resources: [HomeResource]
      })
      await server.run()
      const res = await fetch("http://localhost:1234", {
        method: "POST",
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({ name: "Drash" })
      })
      Rhum.asserts.assertEquals(await res.text(),
        'Drash'
      )
      Rhum.asserts.assertEquals(res.status, 200)
    })
  })
});

Rhum.run();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends DrashResource {
  static paths = ["/"];
  public GET() {
    this.response.body = JSON.stringify({
      success: true
    });
    return this.response;
  }
  public POST() {
    this.response.body = JSON.stringify(this.request.bodyParam('name'));
    return this.response;
  }
}
