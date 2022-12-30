import * as Drash from "../../mod.ts";
import { assertEquals } from "../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends Drash.Resource {
  public paths = [
    "/",
  ];

  public async POST(
    request: Drash.Request,
    response: Drash.Response,
  ): Promise<void> {
    const methodToExecute = request.queryParam("method_to_execute");

    let body: unknown;

    try {
      switch (methodToExecute) {
        case "arrayBuffer":
          body = await request.arrayBuffer();
          break;
        case "blob":
          body = await request.blob();
          break;
        case "formData":
          body = await request.formData();
          break;
        case "json":
          body = JSON.stringify(await request.json());
          break;
        case "text":
        default:
          body = await request.text();
          break;
      }
      response.text(body as string);
    } catch (error) {
      response.text(error.message);
    }
  }
}

const createServer = (readBody: boolean) =>
  new Drash.Server({
    hostname: "localhost",
    port: 1447,
    protocol: "http",
    resources: [
      HomeResource,
    ],
    request: {
      read_body: readBody,
    },
  });

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("Drash.Server#options.request", async (t) => {
  await t.step("read_body: true", async (t) => {
    await t.step(
      "calling request.blob() returns 'Body already consumed' response",
      async () => {
        const server = createServer(true);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=blob",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, "Body already consumed.");
        await server.close();
      },
    );

    await t.step(
      "calling request.json() returns 'Body already consumed' response",
      async () => {
        const server = createServer(true);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=json",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, "Body already consumed.");
        await server.close();
      },
    );

    await t.step(
      "calling request.arrayBuffer() returns 'Body already consumed' response",
      async () => {
        const server = createServer(true);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=arrayBuffer",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, "Body already consumed.");
        await server.close();
      },
    );

    await t.step(
      "calling request.text() returns 'Body already consumed' response",
      async () => {
        const server = createServer(true);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=text",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, "Body already consumed.");
        await server.close();
      },
    );

    await t.step(
      "calling request.formData() returns 'Body already consumed' response",
      async () => {
        const server = createServer(true);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=formData",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, "Body already consumed.");
        await server.close();
      },
    );
  });

  await t.step("read_body: false", async (t) => {
    await t.step(
      "calling request.blob() returns body that was sent in request",
      async () => {
        const server = createServer(false);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=blob",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, `{"something":"random"}`);
        await server.close();
      },
    );

    await t.step(
      "calling request.json() returns body that was sent in request",
      async () => {
        const server = createServer(false);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=json",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, `{"something":"random"}`);
        await server.close();
      },
    );

    await t.step(
      "calling request.arrayBuffer() returns body that was sent in request",
      async () => {
        const server = createServer(false);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=arrayBuffer",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, `{"something":"random"}`);
        await server.close();
      },
    );

    await t.step(
      "calling request.text() returns body that was sent in request",
      async () => {
        const server = createServer(false);
        server.run();

        const response = await fetch(
          "http://localhost:1447?method_to_execute=text",
          {
            method: "POST",
            body: JSON.stringify({
              something: "random",
            }),
          },
        );
        const res = await response.text();
        assertEquals(res, `{"something":"random"}`);
        await server.close();
      },
    );

    await t.step(
      "calling request.formData() returns body that was sent in request",
      async () => {
        const server = createServer(false);
        server.run();

        const formData = new FormData();
        const file = new Blob([
          new File([new ArrayBuffer(10)], "mod.ts"),
        ], {
          type: "application/javascript",
        });
        formData.append("foo[]", file, "mod.ts");

        const response = await fetch(
          "http://localhost:1447?method_to_execute=formData",
          {
            method: "POST",
            body: formData,
          },
        );

        const res = await response.text();
        const cd = `Content-Disposition: form-data;`;
        const name = `name="foo[]"; filename="mod.ts"`;

        assertEquals(res.includes(cd), true);
        assertEquals(res.includes(name), true);
        await server.close();
      },
    );
  });
});
