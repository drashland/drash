import { DrashRequest } from "../../mod.ts";
import { assertEquals, test } from "../deps.ts";
import type { Cookie } from "../deps.ts";

const mockUrl = "https://drash.land";

function requestFactory(info: RequestInfo, init?: RequestInit) {
  return new DrashRequest(info, init);
}

function setCookieSimulatedRequest(cookies: Cookie[]) {
  const headers = new Headers();
  const outString: string[] = [];
  for (const { name, value } of cookies) {
    outString.push(`${name}=${value}`);
  }
  headers.set("Cookie", outString.join("; "));
  return headers;
}

test("Request initial query size should equal to zero", function () {
  const request1 = requestFactory(`${mockUrl}`);
  assertEquals(Array.from(request1.query).length, 0);

  const request2 = requestFactory(`${mockUrl}?`);
  assertEquals(Array.from(request2.query).length, 0);
});

test("Request query size should equal to one", function () {
  const request1 = requestFactory(`${mockUrl}?foo`);
  assertEquals(Array.from(request1.query).length, 1);

  const request2 = requestFactory(`${mockUrl}?foo=bar`);
  assertEquals(Array.from(request2.query).length, 1);

  const request3 = requestFactory(`${mockUrl}?foo=bar&`);
  assertEquals(Array.from(request3.query).length, 1);

  const request5 = requestFactory(`${mockUrl}?foo=%02%03`);
  assertEquals(Array.from(request5.query).length, 1);
});

test("Request query size should equal to two", function () {
  const request1 = requestFactory(`${mockUrl}?foo=bar&hello`);
  assertEquals(Array.from(request1.query).length, 2);

  const request2 = requestFactory(`${mockUrl}?foo=bar&hello=world`);
  assertEquals(Array.from(request2.query).length, 2);

  const request3 = requestFactory(`${mockUrl}?foo=bar&hello=world&`);
  assertEquals(Array.from(request3.query).length, 2);

  const request4 = requestFactory(`${mockUrl}?foo=bar&hello=`);
  assertEquals(Array.from(request4.query).length, 2);
});

test("Request query size should equal to three", function () {
  const request1 = requestFactory(`${mockUrl}?foo=bar&hello=world&drash=`);
  assertEquals(Array.from(request1.query).length, 3);

  const request2 = requestFactory(`${mockUrl}?foo=bar&hello=world&drash=land`);
  assertEquals(Array.from(request2.query).length, 3);

  const request3 = requestFactory(`${mockUrl}?foo=bar&hello=world&drash`);
  assertEquals(Array.from(request3.query).length, 3);
});

test("Request initial query should be equal to a new URLSearchParams", function () {
  const query = new URLSearchParams()
  const request = requestFactory(`${mockUrl}`);
  assertEquals(query, request.query);
});

test("Request query should contain be equal to a custom URLSearchParams", function () {
  const query = new URLSearchParams();
  query.set("foo", "bar");
  query.set("hello", "world");
  query.set("drash", "land");
  console.log(query.get("foo"))

  const request = requestFactory(`${mockUrl}?foo=bar&hello=world&drash=land`);
  assertEquals(query, request.query);
});

test("Request initial cookies size should equal to zero", function () {
  const request = requestFactory(`${mockUrl}`);
  assertEquals(request.cookies.size, 0);
});

test("Request cookies size should equal to one", function () {
  const cookies: Cookie[] = [];
  const amount = 1;
  for (let i = 0; i < amount; i++) {
    cookies.push(
      {
        name: `foo${i}`,
        value: "value",
      },
    );
  }
  const request = requestFactory(`${mockUrl}`, {
    headers: setCookieSimulatedRequest(cookies),
  });

  assertEquals(request.cookies.size, amount);
});

test("Request cookies size should equal to two", function () {
  const cookies: Cookie[] = [];
  const amount = 2;
  for (let i = 0; i < amount; i++) {
    cookies.push(
      {
        name: `foo${i}`,
        value: "value",
      },
    );
  }
  const request = requestFactory(`${mockUrl}`, {
    headers: setCookieSimulatedRequest(cookies),
  });

  assertEquals(request.cookies.size, amount);
});

test("Request cookies size should equal to three", function () {
  const cookies: Cookie[] = [];
  const amount = 3;
  for (let i = 0; i < amount; i++) {
    cookies.push(
      {
        name: `foo${i}`,
        value: "value",
      },
    );
  }
  const request = requestFactory(`${mockUrl}`, {
    headers: setCookieSimulatedRequest(cookies),
  });

  assertEquals(request.cookies.size, amount);
});

test("Request initial cookies should be equal to a new empty Map", function () {
  const cookies = new Map<string, string>();
  const request = requestFactory(`${mockUrl}`);
  assertEquals(cookies, request.cookies);
});

test("Request cookies should contain be equal to a custom Map", function () {
  const cookies: Cookie[] = [];
  const customMap = new Map<string, string>();
  const amount = 3;
  for (let i = 0; i < amount; i++) {
    cookies.push(
      {
        name: `foo${i}`,
        value: "value",
      },
    );
    customMap.set(`foo${i}`, "value");
  }
  const request = requestFactory(`${mockUrl}`, {
    headers: setCookieSimulatedRequest(cookies),
  });

  assertEquals(request.cookies, customMap);
});

test("Request protocol should be equal to https", function () {
  const request = requestFactory(`${mockUrl}`);

  assertEquals(request.protocol, "https");
});

test("Request protocol should be equal to http", function () {
  const request = requestFactory(`${mockUrl.replace("https", "http")}`);

  assertEquals(request.protocol, "http");
});

test("Request hostname should be equal to drash.land", function () {
  const request = requestFactory(`${mockUrl}`);

  assertEquals(request.hostname, "drash.land");
});

test("Request pathname should be equal to /foo/bar", function () {
  const request = requestFactory(`${mockUrl}/foo/bar`);

  assertEquals(request.pathname, "/foo/bar");
});

test("Request baseUrl should be equal to https://drash.land", function () {
  const request = requestFactory(`${mockUrl}/foo/bar`);

  assertEquals(request.baseUrl, "https://drash.land");
});
