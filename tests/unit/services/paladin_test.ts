import { Rhum } from "../../deps.ts";
import { PaladinService } from "../../../src/services/paladin/paladin.ts";
import {
  IResource,
  Request,
  Resource,
  Response,
  Server,
} from "../../../mod.ts";

class Res extends Resource implements IResource {
  paths = ["/"];
  public GET(_request: Request, response: Response) {
    response.text("Hello world!");
  }
}

function runServer(
  paladin: PaladinService, // eg `const paladin = new new PaladinService()`, imported from paladin/mod.ts
  port: number,
): Server {
  const server = new Server({
    resources: [Res],
    services: [paladin],
    protocol: "http",
    hostname: "localhost",
    port,
  });
  server.run();
  return server;
}

Rhum.testPlan("Paladin - mod_test.ts", () => {
  Rhum.testSuite("X-XSS-Protection Header", () => {
    Rhum.testCase("Sets the header by Default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1667);
      const res = await fetch("http://localhost:1667/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-XSS-Protection");
      Rhum.asserts.assertEquals(header, "1; mode=block");
      await server.close();
    });
    Rhum.testCase("Sets the header when config is true", async () => {
      const paladin = new PaladinService({
        "X-XSS-Protection": true,
      });
      const server = runServer(paladin, 1668);
      const res = await fetch("http://localhost:1668/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-XSS-Protection");
      Rhum.asserts.assertEquals(header, "1; mode=block");
      await server.close();
    });
    Rhum.testCase("Does not set the header when config is false", async () => {
      const paladin = new PaladinService({
        "X-XSS-Protection": false,
      });
      const server = runServer(paladin, 1669);
      const res = await fetch("http://localhost:1669/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-XSS-Protection");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
  });
  Rhum.testSuite("Referrer-Policy header", () => {
    Rhum.testCase("Does not set the header by default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1670);
      const res = await fetch("http://localhost:1670/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Referrer-Policy");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
    Rhum.testCase("Sets the header when passed in", async () => {
      const paladin = new PaladinService({
        "Referrer-Policy": "origin",
      });
      const server = runServer(paladin, 1670);
      const res = await fetch("http://localhost:1670/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Referrer-Policy");
      Rhum.asserts.assertEquals(header, "origin");
      await server.close();
    });
  });
  Rhum.testSuite("X-Content-Type-Options header", () => {
    Rhum.testCase("Sets the header by Default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1650);
      const res = await fetch("http://localhost:1650/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Content-Type-Options");
      Rhum.asserts.assertEquals(header, "nosniff");
      await server.close();
    });
    Rhum.testCase("Sets the header when config is true", async () => {
      const paladin = new PaladinService({
        "X-Content-Type-Options": true,
      });
      const server = runServer(paladin, 1651);
      const res = await fetch("http://localhost:1651/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Content-Type-Options");
      Rhum.asserts.assertEquals(header, "nosniff");
      await server.close();
    });
    Rhum.testCase("Does not set the header when config is false", async () => {
      const paladin = new PaladinService({
        "X-Content-Type-Options": false,
      });
      const server = runServer(paladin, 1652);
      const res = await fetch("http://localhost:1652/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Content-Type-Options");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
  });
  Rhum.testSuite("Strict-Transport-Security header", () => {
    Rhum.testCase("Is set by default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1671);
      const res = await fetch("http://localhost:1671/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Strict-Transport-Security");
      Rhum.asserts.assertEquals(header, "max-age=5184000; include_sub_domains");
      await server.close();
    });
    Rhum.testCase("Is set when max_age is set", async () => {
      const paladin = new PaladinService({
        hsts: {
          max_age: 101,
        },
      });
      const server = runServer(paladin, 1671);
      const res = await fetch("http://localhost:1671/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Strict-Transport-Security");
      Rhum.asserts.assertEquals(header, "max-age=101; include_sub_domains");
      await server.close();
    });
    Rhum.testCase("Not set when max_age is false", async () => {
      const paladin = new PaladinService({
        hsts: {
          max_age: false,
        },
      });
      const server = runServer(paladin, 1671);
      const res = await fetch("http://localhost:1671/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Strict-Transport-Security");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
    Rhum.testCase("Set header but disable include_sub_domains", async () => {
      const paladin = new PaladinService({
        hsts: {
          include_sub_domains: false,
        },
      });
      const server = runServer(paladin, 1672);
      const res = await fetch("http://localhost:1672/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Strict-Transport-Security");
      Rhum.asserts.assertEquals(header, "max-age=5184000");
      await server.close();
    });
    Rhum.testCase("Set and explicitly enable include_sub_domains", async () => {
      const paladin = new PaladinService({
        hsts: {
          include_sub_domains: true,
        },
      });
      const server = runServer(paladin, 1673);
      const res = await fetch("http://localhost:1673/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Strict-Transport-Security");
      Rhum.asserts.assertEquals(header, "max-age=5184000; include_sub_domains");
      await server.close();
    });
    Rhum.testCase(
      "Set header and explicitly set preload to false",
      async () => {
        const paladin = new PaladinService({
          hsts: {
            preload: false,
          },
        });
        const server = runServer(paladin, 1674);
        const res = await fetch("http://localhost:1674/", {
          headers: {
            Accept: "text/plain",
          },
        });
        await res.arrayBuffer();
        const header = res.headers.get("Strict-Transport-Security");
        Rhum.asserts.assertEquals(
          header,
          "max-age=5184000; include_sub_domains",
        );
        await server.close();
      },
    );
    Rhum.testCase("Set header and set preload", async () => {
      const paladin = new PaladinService({
        hsts: {
          preload: true,
        },
      });
      const server = runServer(paladin, 1675);
      const res = await fetch("http://localhost:1675/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Strict-Transport-Security");
      Rhum.asserts.assertEquals(
        header,
        "max-age=5184000; include_sub_domains; preload",
      );
      await server.close();
    });
  });
  Rhum.testSuite("X-Powered-By header", () => {
    Rhum.testCase("Header removed by default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1675);
      const res = await fetch("http://localhost:1675/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Powered-By");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
    Rhum.testCase("Header removed when explicitly asked to", async () => {
      const paladin = new PaladinService({
        "X-Powered-By": false,
      });
      const server = runServer(paladin, 1675);
      const res = await fetch("http://localhost:1675/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Powered-By");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
    Rhum.testCase("Header can be modified", async () => {
      const paladin = new PaladinService({
        "X-Powered-By": "You will never know, mwuahaha",
      });
      const server = runServer(paladin, 1676);
      const res = await fetch("http://localhost:1676/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Powered-By");
      Rhum.asserts.assertEquals(header, "You will never know, mwuahaha");
      await server.close();
    });
    // We don't set it so it cannot be tested
    // TODO(ebebbington) Maybe we could try set the header in some hacky way, to test this?
    // Rhum.testCase("Header is still set when set to true", async () => {
    //   const paladin = new PaladinService({
    //     "X-Powered-By": true
    //   })
    //   const server = runServer(paladin, 1675)
    //   const res = await fetch("http://localhost:1675/");
    //   await res.arrayBuffer()
    //   const header = res.headers.get("X-Powered-By")
    //   Rhum.asserts.assertEquals(header, "i should still be set")
    //   server.close()
    // })
  });
  Rhum.testSuite("X-Frame-Options header", () => {
    Rhum.testCase("Sets the header by default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1677);
      const res = await fetch("http://localhost:1677/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Frame-Options");
      Rhum.asserts.assertEquals(header, "SAMEORIGIN");
      await server.close();
    });
    Rhum.testCase("Will not set the header if config is false", async () => {
      const paladin = new PaladinService({
        "X-Frame-Options": false,
      });
      const server = runServer(paladin, 1678);
      const res = await fetch("http://localhost:1678/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Frame-Options");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
    Rhum.testCase("Sets the head when explicitly done so", async () => {
      const paladin = new PaladinService({
        "X-Frame-Options": "DENY",
      });
      const server = runServer(paladin, 1679);
      const res = await fetch("http://localhost:1679/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-Frame-Options");
      Rhum.asserts.assertEquals(header, "DENY");
      await server.close();
    });
  });
  Rhum.testSuite("Expect-CT header", () => {
    Rhum.testCase("Does not set the header by default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1680);
      const res = await fetch("http://localhost:1680/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Expect-CT");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
    Rhum.testCase("Set the header and set the max age", async () => {
      const paladin = new PaladinService({
        expect_ct: {
          max_age: 30,
        },
      });
      const server = runServer(paladin, 1681);
      const res = await fetch("http://localhost:1681/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Expect-CT");
      Rhum.asserts.assertEquals(header, "max-age=30");
      await server.close();
    });
    Rhum.testCase("Set the header and set enforce", async () => {
      const paladin = new PaladinService({
        expect_ct: {
          max_age: 30,
          enforce: true,
        },
      });
      const server = runServer(paladin, 1682);
      const res = await fetch("http://localhost:1682/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Expect-CT");
      Rhum.asserts.assertEquals(header, "max-age=30; enforce");
      await server.close();
    });
    Rhum.testCase("set the header and set report_uri", async () => {
      const paladin = new PaladinService({
        expect_ct: {
          max_age: 30,
          report_uri: "hello",
        },
      });
      const server = runServer(paladin, 1683);
      const res = await fetch("http://localhost:1683/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Expect-CT");
      Rhum.asserts.assertEquals(header, "max-age=30; hello");
      await server.close();
    });
  });
  Rhum.testSuite("X-DNS-Prefetch-Control header", () => {
    Rhum.testCase("Is set by default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1684);
      const res = await fetch("http://localhost:1684/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-DNS-Prefetch-Control");
      Rhum.asserts.assertEquals(header, "off");
      await server.close();
    });
    Rhum.testCase("Can explicitly be set to off", async () => {
      const paladin = new PaladinService({
        "X-DNS-Prefetch-Control": false,
      });
      const server = runServer(paladin, 1685);
      const res = await fetch("http://localhost:1685/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-DNS-Prefetch-Control");
      Rhum.asserts.assertEquals(header, "off");
      await server.close();
    });
    Rhum.testCase("Can be set to on", async () => {
      const paladin = new PaladinService({
        "X-DNS-Prefetch-Control": true,
      });
      const server = runServer(paladin, 1686);
      const res = await fetch("http://localhost:1686/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("X-DNS-Prefetch-Control");
      Rhum.asserts.assertEquals(header, "on");
      await server.close();
    });
  });
  Rhum.testSuite("Content-Security-Policy header", () => {
    Rhum.testCase("Is not set by default", async () => {
      const paladin = new PaladinService();
      const server = runServer(paladin, 1687);
      const res = await fetch("http://localhost:1687/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Content-Security-Policy");
      Rhum.asserts.assertEquals(header, null);
      await server.close();
    });
    Rhum.testCase("Can be set if config is set", async () => {
      const paladin = new PaladinService({
        "Content-Security-Policy": "Something something",
      });
      const server = runServer(paladin, 1688);
      const res = await fetch("http://localhost:1688/", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.arrayBuffer();
      const header = res.headers.get("Content-Security-Policy");
      Rhum.asserts.assertEquals(header, "Something something");
      await server.close();
    });
  });
});

Rhum.run();
