import members from "../tests/members.ts";
members.test("CookieResource", async () => {
  let response;
  let cookies;
  let cookieName;
  let cookieVal;

  const cookie = { name: "testCookie", value: "Drash" };

  // Post
  response = await members.fetch.post("http://localhost:1667/cookie", {
    headers: {
      "Content-Type": "application/json",
      token: "zeToken",
    },
    body: cookie,
  });
  members.assert.equals(await response.text(), '"Saved your cookie!"');

  // Get - Dependent on the above post request saving a cookie
  response = await members.fetch.get("http://localhost:1667/cookie", {
    credentials: "same-origin",
    headers: {
      Cookie: "testCookie=Drash",
      token: "zeToken",
    },
  });
  await members.assert.equals(await response.text(), '"Drash"');

  // Remove - Dependent on the above post request saving a cookie
  response = await members.fetch.delete("http://localhost:1667/cookie", {
    headers: {
      token: "zeToken",
    },
  });
  cookies = response.headers.get("set-cookie") || "";
  cookieVal = cookies.split(";")[0].split("=")[1];
  members.assert.equals(cookieVal, "");
  await response.arrayBuffer();
  //await response.body.close()
});
