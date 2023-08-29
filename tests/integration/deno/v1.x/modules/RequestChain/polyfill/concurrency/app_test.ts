import { asserts } from "../../../../../../../deps.ts";
import { handleRequest, hostname, port, protocol } from "./app.ts";

const url = `${protocol}://${hostname}:${port}`;

Deno.test("Polyfill - Using Request/Response", async (t) => {
  await t.step("Accounts /accounts paths = /accounts", async (t) => {
    await t.step(`GET waits with header x-wait-1`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET",
        headers: {
          "x-wait-1": "yup"
        }
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200)
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Waited for x-wait-1!");
        });
    });

    await t.step(`GET does not wait`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET"
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200)
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Hello from Accounts.GET(). Didn't wait!");
        });
    });

    await t.step(`GET waits with header x-wait-2`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET",
        headers: {
          "x-wait-2": "yup"
        }
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200)
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Waited for x-wait-2!");
        });
    });

    await t.step(`GET does not wait`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET"
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200)
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Hello from Accounts.GET(). Didn't wait!");
        });
    });

    await t.step(`GET waits with header x-wait-3`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET",
        headers: {
          "x-wait-3": "yup"
        }
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200)
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Waited for x-wait-3!");
        });
    });

    await t.step(`GET does not wait`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET"
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200)
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Hello from Accounts.GET(). Didn't wait!");
        });
    });
  });
});
