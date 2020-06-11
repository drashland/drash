import members from "../../members.ts";

members.testSuite("FilesResource", () => {
  members.test("multipart/form-data works", async () => {
    let response;

    let formData = new FormData();
    formData.append("file_1", "John");

    response = await fetch("http://localhost:3000/files", {
      method: "POST",
      body: formData,
    });
    members.assertEquals(await response.text(), '"John"');
  });
});
