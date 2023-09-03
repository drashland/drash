import { asserts } from "../../../../../../../deps.ts";
import { handleRequest, hostname, port, protocol } from "./app.ts";

const url = `${protocol}://${hostname}:${port}`;

Deno.test("Polyfill - Using Request/Response", async (t) => {
  await t.step("Accounts /accounts paths = /accounts", async (t) => {
    await t.step(`GET does not wait`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET",
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200);
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Hello from Accounts.GET(). Didn't wait!");
        });
    });

    await t.step(
      `GET waits with header x-wait-1 (method: Promise.all())`,
      () => {
        const req1 = new Request(url + "/accounts", {
          method: "GET",
          headers: {
            "x-wait-1": "yup",
          },
        });

        const p1 = handleRequest(req1)
          .then((response) => {
            asserts.assertEquals(response?.status, 200);
            return response;
          })
          .then((response) => response.text());

        const req2 = new Request(url + "/accounts", {
          method: "GET",
        });

        const p2 = handleRequest(req2)
          .then((response) => {
            asserts.assertEquals(response?.status, 200);
            return response;
          })
          .then((response) => response.text());

        return Promise.all([
          p1,
          p2,
        ])
          .then(([res1, res2]) => {
            asserts.assertEquals(res1, "Waited for x-wait-1!");
            asserts.assertEquals(
              res2,
              "Hello from Accounts.GET(). Didn't wait!",
            );
          });
      },
    );

    await t.step(
      `GET does not wait for header x-wait-1 request (method: Promise.any())`,
      () => {
        return new Promise<void>((resolve) => {
          // This will go to the `setTimeout()` call in the resource
          const req1 = new Request(url + "/accounts", {
            method: "GET",
            headers: {
              "x-wait-1": "yup",
            },
          });

          const req1Promise = handleRequest(req1)
            .then((response) => {
              asserts.assertEquals(response?.status, 200);
              return response;
            })
            .then((response) => response.text())
            .then((res) => {
              asserts.assertEquals(res, "Waited for x-wait-1!");

              // We need to resolve here so the test does not finish BEFORE this request's response is
              // retrieved. The resource will still be processing the `setTimeout()` call when `req2`
              // below resolves. We are only checking to see if `req2` resolves faster than `req1` in
              // this test, but we need to make sure both requests resolve before the test finishes.
              // Otherwise we run into the "async ops" error.
              resolve();
            });

          // This will not go to the `setTimeout()` call in the resource, so we
          // should expect this request to come back to use BEFORE the `req1`
          // request above
          const req2 = new Request(url + "/accounts", {
            method: "GET",
          });

          const req2Promise = handleRequest(req2)
            .then((response) => {
              asserts.assertEquals(response?.status, 200);
              return response;
            })
            .then((response) => response.text());

          return Promise.any([
            req1Promise, // This request is first so we can assert it does not block requests
            req2Promise, // This request SHOULD NOT BE BLOCKED by the above request
          ])
            .then((req2Response) => {
              asserts.assertEquals(
                req2Response,
                "Hello from Accounts.GET(). Didn't wait!",
              );
            });
        });
      },
    );

    await t.step(`GET waits with header x-wait-2`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET",
        headers: {
          "x-wait-2": "yup",
        },
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200);
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Waited for x-wait-2!");
        });
    });

    await t.step(`GET waits with header x-wait-3`, () => {
      const req = new Request(url + "/accounts", {
        method: "GET",
        headers: {
          "x-wait-3": "yup",
        },
      });

      return handleRequest(req)
        .then((response) => {
          asserts.assertEquals(response?.status, 200);
          return response;
        })
        .then((response) => response.text())
        .then((body) => {
          asserts.assertEquals(body, "Waited for x-wait-3!");
        });
    });
  });
});
