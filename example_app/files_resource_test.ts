import members from "../tests/members.ts";
members.test("FilesResource", async () => {
  let response;

  let formData = new FormData();
  formData.append("file_1", "John");

  response = await fetch("http://localhost:1667/files", {
    method: "POST",
    headers: {
      token: "zeToken",
    },
    body: formData,
  });
  members.assert.equals(await response.text(), '"John"');
});
