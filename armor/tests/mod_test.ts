import { Rhum } from "../../test_deps.ts";
import { Armor } from "../mod.ts";
import { Drash } from "../../deps.ts"

class Resource extends Drash.Http.Resource  {
  static paths = ["/"]
  public GET() {
    this.response.body = "Hello world!"
    return this.response
  }
}

async function runServer (armor: any, port: number): Promise<Drash.Http.Server> {
  const server = new Drash.Http.Server({
    resources: [Resource],
    middleware: {
      after_request: [
          armor
      ]
    }
  })
  await server.run({
    hostname: "localhost",
    port: port
  })
  return server
}


Rhum.testPlan("Armor - mod_test.ts", () => {
  Rhum.testSuite("X-XSS-Protection Header", () => {
    Rhum.testCase("Sets the header by Default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1667)
      const res = await fetch("http://localhost:1667/");
      await res.arrayBuffer()
      const header = res.headers.get("X-XSS-Protection")
      Rhum.asserts.assertEquals(header, "1; mode=block")
      await server.close()
    })
    Rhum.testCase("Sets the header when config is true", async () => {
      const armor = Armor({
        "X-XSS-Protection": true
      })
      const server = await runServer(armor, 1668)
      const res = await fetch("http://localhost:1668/");
      await res.arrayBuffer()
      const header = res.headers.get("X-XSS-Protection")
      Rhum.asserts.assertEquals(header, "1; mode=block")
      await server.close()
    })
    Rhum.testCase("Does not set the header when config is false", async () => {
      const armor = Armor({
        "X-XSS-Protection": false
      })
      const server = await runServer(armor, 1669)
      const res = await fetch("http://localhost:1669/");
      await res.arrayBuffer()
      const header = res.headers.get("X-XSS-Protection")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
  })
  Rhum.testSuite("Referrer-Policy header", () => {
    Rhum.testCase("Does not set the header by default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1670)
      const res = await fetch("http://localhost:1670/");
      await res.arrayBuffer()
      const header = res.headers.get("Referrer-Policy")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
    Rhum.testCase("Sets the header when passed in", async () => {
      const armor = Armor({
        "Referrer-Policy": "origin"
      })
      const server = await runServer(armor, 1670)
      const res = await fetch("http://localhost:1670/");
      await res.arrayBuffer()
      const header = res.headers.get("Referrer-Policy")
      Rhum.asserts.assertEquals(header, "origin")
      await server.close()
    })
  })
  Rhum.testSuite("X-Content-Type-Options header", () => {
    Rhum.testCase("Sets the header by Default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1650)
      const res = await fetch("http://localhost:1650/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Content-Type-Options")
      Rhum.asserts.assertEquals(header, "nosniff")
      await server.close()
    })
    Rhum.testCase("Sets the header when config is true", async () => {
      const armor = Armor({
        "X-Content-Type-Options": true
      })
      const server = await runServer(armor, 1651)
      const res = await fetch("http://localhost:1651/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Content-Type-Options")
      Rhum.asserts.assertEquals(header, "nosniff")
      await server.close()
    })
    Rhum.testCase("Does not set the header when config is false", async () => {
      const armor = Armor({
        "X-Content-Type-Options": false
      })
      const server = await runServer(armor, 1652)
      const res = await fetch("http://localhost:1652/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Content-Type-Options")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
  })
  Rhum.testSuite("Strict-Transport-Security header", () => {
    Rhum.testCase("Is set by default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1671)
      const res = await fetch("http://localhost:1671/");
      await res.arrayBuffer()
      const header = res.headers.get("Strict-Transport-Security")
      Rhum.asserts.assertEquals(header, "max-age=5184000; includeSubDomains")
      await server.close()
    })
    Rhum.testCase("Is set when maxAge is set", async () => {
      const armor = Armor({
        hsts: {
          maxAge: 101
        }
      })
      const server = await runServer(armor, 1671)
      const res = await fetch("http://localhost:1671/");
      await res.arrayBuffer()
      const header = res.headers.get("Strict-Transport-Security")
      Rhum.asserts.assertEquals(header, "max-age=101; includeSubDomains")
      await server.close()
    })
    Rhum.testCase("Not set when maxAge is false", async () => {
      const armor = Armor({
        hsts: {
          maxAge: false
        }
      })
      const server = await runServer(armor, 1671)
      const res = await fetch("http://localhost:1671/");
      await res.arrayBuffer()
      const header = res.headers.get("Strict-Transport-Security")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
    Rhum.testCase("Set header but disable includeSubDomains", async () => {
      const armor = Armor({
        hsts: {
          includeSubDomains: false
        }
      })
      const server = await runServer(armor, 1672)
      const res = await fetch("http://localhost:1672/");
      await res.arrayBuffer()
      const header = res.headers.get("Strict-Transport-Security")
      Rhum.asserts.assertEquals(header, "max-age=5184000")
      await server.close()
    })
    Rhum.testCase("Set and explicitly enable includeSubDomains", async () => {
      const armor = Armor({
        hsts: {
          includeSubDomains: true
        }
      })
      const server = await runServer(armor, 1673)
      const res = await fetch("http://localhost:1673/");
      await res.arrayBuffer()
      const header = res.headers.get("Strict-Transport-Security")
      Rhum.asserts.assertEquals(header, "max-age=5184000; includeSubDomains")
      await server.close()
    })
    Rhum.testCase("Set header and explicitly set preload to false", async () => {
      const armor = Armor({
        hsts: {
          preload: false
        }
      })
      const server = await runServer(armor, 1674)
      const res = await fetch("http://localhost:1674/");
      await res.arrayBuffer()
      const header = res.headers.get("Strict-Transport-Security")
      Rhum.asserts.assertEquals(header, "max-age=5184000; includeSubDomains")
      await server.close()
    })
    Rhum.testCase("Set header and set preload", async () => {
      const armor = Armor({
        hsts: {
          preload: true
        }
      })
      const server = await runServer(armor, 1675)
      const res = await fetch("http://localhost:1675/");
      await res.arrayBuffer()
      const header = res.headers.get("Strict-Transport-Security")
      Rhum.asserts.assertEquals(header, "max-age=5184000; includeSubDomains; preload")
      await server.close()
    })
  })
  Rhum.testSuite("X-Powered-By header", () => {
    Rhum.testCase("Header removed by default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1675)
      const res = await fetch("http://localhost:1675/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Powered-By")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
    Rhum.testCase("Header removed when explicitly asked to", async () => {
      const armor = Armor({
        "X-Powered-By": false
      })
      const server = await runServer(armor, 1675)
      const res = await fetch("http://localhost:1675/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Powered-By")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
    Rhum.testCase("Header can be modified", async () => {
      const armor = Armor({
        "X-Powered-By": "You will never know, mwuahaha"
      })
      const server = await runServer(armor, 1676)
      const res = await fetch("http://localhost:1676/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Powered-By")
      Rhum.asserts.assertEquals(header, "You will never know, mwuahaha")
      await server.close()
    })
    // We don't set it so it cannot be tested
    // TODO(ebebbington) Maybe we could try set the header in some hacky way, to test this?
    // Rhum.testCase("Header is still set when set to true", async () => {
    //   const armor = Armor({
    //     "X-Powered-By": true
    //   })
    //   const server = await runServer(armor, 1675)
    //   const res = await fetch("http://localhost:1675/");
    //   await res.arrayBuffer()
    //   const header = res.headers.get("X-Powered-By")
    //   Rhum.asserts.assertEquals(header, "i should still be set")
    //   await server.close()
    // })
  })
  Rhum.testSuite("X-Frame-Options header", () => {
    Rhum.testCase("Sets the header by default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1677)
      const res = await fetch("http://localhost:1677/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Frame-Options")
      Rhum.asserts.assertEquals(header, "SAMEORIGIN")
      await server.close()
    })
    Rhum.testCase("Will not set the header if config is false", async () => {
      const armor = Armor({
        "X-Frame-Options": false
      })
      const server = await runServer(armor, 1678)
      const res = await fetch("http://localhost:1678/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Frame-Options")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
    Rhum.testCase("Sets the head when explicitly done so", async () => {
      const armor = Armor({
        "X-Frame-Options": "DENY"
      })
      const server = await runServer(armor, 1679)
      const res = await fetch("http://localhost:1679/");
      await res.arrayBuffer()
      const header = res.headers.get("X-Frame-Options")
      Rhum.asserts.assertEquals(header, "DENY")
      await server.close()
    })
  })
  Rhum.testSuite("Expect-CT header", () => {
    Rhum.testCase("Does not set the header by default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1680)
      const res = await fetch("http://localhost:1680/");
      await res.arrayBuffer()
      const header = res.headers.get("Expect-CT")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
    Rhum.testCase("Set the header and set the max age", async () => {
      const armor = Armor({
        expectCt: {
          maxAge: 30
        }
      })
      const server = await runServer(armor, 1681)
      const res = await fetch("http://localhost:1681/");
      await res.arrayBuffer()
      const header = res.headers.get("Expect-CT")
      Rhum.asserts.assertEquals(header, "max-age=30")
      await server.close()
    })
    Rhum.testCase("Set the header and set enforce", async () => {
      const armor = Armor({
        expectCt: {
          maxAge: 30,
          enforce: true
        }
      })
      const server = await runServer(armor, 1682)
      const res = await fetch("http://localhost:1682/");
      await res.arrayBuffer()
      const header = res.headers.get("Expect-CT")
      Rhum.asserts.assertEquals(header, "max-age=30; enforce")
      await server.close()
    })
    Rhum.testCase("set the header and set reportUri", async () => {
      const armor = Armor({
        expectCt: {
          maxAge: 30,
          reportUri: "hello"
        }
      })
      const server = await runServer(armor, 1683)
      const res = await fetch("http://localhost:1683/");
      await res.arrayBuffer()
      const header = res.headers.get("Expect-CT")
      Rhum.asserts.assertEquals(header, "max-age=30; hello")
      await server.close()
    })
  })
  Rhum.testSuite("X-DNS-Prefetch-Control header", () => {
    Rhum.testCase("Is set by default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1684)
      const res = await fetch("http://localhost:1684/");
      await res.arrayBuffer()
      const header = res.headers.get("X-DNS-Prefetch-Control")
      Rhum.asserts.assertEquals(header, "off")
      await server.close()
    })
    Rhum.testCase("Can explicitly be set to off", async () => {
      const armor = Armor({
        "X-DNS-Prefetch-Control": false
      })
      const server = await runServer(armor, 1685)
      const res = await fetch("http://localhost:1685/");
      await res.arrayBuffer()
      const header = res.headers.get("X-DNS-Prefetch-Control")
      Rhum.asserts.assertEquals(header, "off")
      await server.close()
    })
    Rhum.testCase("Can be set to on", async () => {
      const armor = Armor({
        "X-DNS-Prefetch-Control": true
      })
      const server = await runServer(armor, 1686)
      const res = await fetch("http://localhost:1686/");
      await res.arrayBuffer()
      const header = res.headers.get("X-DNS-Prefetch-Control")
      Rhum.asserts.assertEquals(header, "on")
      await server.close()
    })
  })
  Rhum.testSuite("Content-Security-Policy header", () => {
    Rhum.testCase("Is not set by default", async () => {
      const armor = Armor()
      const server = await runServer(armor, 1687)
      const res = await fetch("http://localhost:1687/");
      await res.arrayBuffer()
      const header = res.headers.get("Content-Security-Policy")
      Rhum.asserts.assertEquals(header, null)
      await server.close()
    })
    Rhum.testCase("Can be set if config is set", async () => {
      const armor = Armor({
        "Content-Security-Policy": "Something something"
      })
      const server = await runServer(armor, 1688)
      const res = await fetch("http://localhost:1688/");
      await res.arrayBuffer()
      const header = res.headers.get("Content-Security-Policy")
      Rhum.asserts.assertEquals(header, "Something something")
      await server.close()
    })
  })
})

Rhum.run()