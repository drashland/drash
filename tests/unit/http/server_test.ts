import { Rhum } from "../../deps.ts";
import { Server } from "../../../src/http/server.ts"
import { IContext, Resource } from "../../../mod.ts"

class HomeResource extends Resource {
  static paths = ["/"];
  public GET(context: IContext) {
    context.response.body = JSON.stringify({
      success: true
    });
  }
  public POST(context: IContext) {
    context.response.body = JSON.stringify(context.request.bodyParam('name'));
  }
}

const server = new Server({ port: 1234, resources: [HomeResource], protocol: "http", hostname: "localhost" });

Rhum.testPlan("http/server_test.ts", () => {

  Rhum.testSuite("address", () => {
    Rhum.testCase("Should correctly format the address", () => {
      const server1 = new Server({ protocol: "https", hostname: "hosty" ,port: 1234, resources: [HomeResource] })
      const server2 = new Server({ port: 1234, resources: [HomeResource], protocol: "http", hostname: "ello" })
      server1.close()
      server2.close()
      Rhum.asserts.assertEquals(server1.address, "https://hosty:1234")
      Rhum.asserts.assertEquals(server2.address, "http://ello:1234")
    })
  })

  Rhum.testSuite("close()", () => {
    Rhum.testCase("Closes the server", async () => {
      server.run();
      // can connect
      const conn = await Deno.connect({
        hostname: "localhost",
        port: 1234
      })
      conn.close()
      // and then close
      server.close();
      let errorThrown = false
      try {
        await Deno.connect({
          hostname: "localhost",
          port: 1234
        })
      } catch (e) {
        errorThrown = true
      }
      Rhum.asserts.assertEquals(errorThrown, true)
      // assertThrowsAsync(async () => {
      //   await Deno.connect({
      //   hostname: "localhost",
      //   port: 1234
      // })
    //})
    });
  });

  Rhum.testSuite("run()", () => {
    Rhum.testCase("Will listen correctly and send the proper response", async () => {
      server.run()
      const res = await fetch("http://localhost:1234")
      server.close()
      Rhum.asserts.assertEquals(await res.json(),
        {
          success: true
        }
      )
      Rhum.asserts.assertEquals(res.status, 200)
    })
    Rhum.testCase("Will throw a 404 if no resource found matching the uri", async () => {
      server.run()
      const res = await fetch("http://localhost:1234/dont/exist")
      await res.text()
      server.close()
      Rhum.asserts.assertEquals(res.status, 404)
    })
    Rhum.testCase("Will throw a 405 if the req method isnt found on the resource", async () => {
      server.run()
      const res = await fetch("http://localhost:1234", {
        method: "OPTIONS"
      })
      await res.text()
      server.close()
      Rhum.asserts.assertEquals(res.status, 405)
    })
    Rhum.testCase("Will parse the body if it exists on the request", async () => {
      server.run()
      const res = await fetch("http://localhost:1234", {
        method: "POST",
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({ name: "Drash" })
      })
      server.close()
      Rhum.asserts.assertEquals(await res.text(),
        '"Drash"'
      )
      Rhum.asserts.assertEquals(res.status, 200)
    })
  })
});

Rhum.run();