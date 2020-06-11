import members from "../../members.ts";

members.testSuite("HomeResource", () => {
  members.test("only defined methods are accessible", async () => {
    let response;

    response = await members.fetch.get("http://localhost:3000");
    members.assertEquals(await response.text(), '"GET request received!"');

    response = await members.fetch.get("http://localhost:3000/home");
    members.assertEquals(await response.text(), '"GET request received!"');

    response = await members.fetch.get("http://localhost:3000/home/");
    members.assertEquals(await response.text(), '"GET request received!"');

    response = await members.fetch.get("http://localhost:3000/home//");
    members.assertEquals(await response.text(), '"Not Found"');

    response = await members.fetch.post("http://localhost:3000");
    members.assertEquals(await response.text(), '"POST request received!"');

    response = await members.fetch.put("http://localhost:3000");
    members.assertEquals(await response.text(), '"PUT request received!"');

    response = await members.fetch.delete("http://localhost:3000");
    members.assertEquals(await response.text(), '"DELETE request received!"');

    response = await members.fetch.patch("http://localhost:3000");
    members.assertEquals(await response.text(), '"Method Not Allowed"');
  });
});
