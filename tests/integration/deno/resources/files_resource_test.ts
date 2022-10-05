// import { assertEquals, TestHelpers } from "../deps.ts";
// import { Request, Resource, Response, Server } from "../../../mod.deno.ts";

// ////////////////////////////////////////////////////////////////////////////////
// // FILE MARKER - APP SETUP /////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////

// class FilesResource extends Resource {
//   paths = ["/files"];

//   public POST(request: Request, response: Response) {
//     return response.text(
//       request.bodyParam("value_1") ?? "No body param was set.",
//     );
//   }
// }

// async function runServer(): Promise<TestHelpers.Server> {
//   return await TestHelpers.runServer(
//     {
//       resources: [
//         FilesResource,
//       ],
//     },
//     {
//       port: 3000,
//       hostname: "localhost",
//     },
//   );
// }

// ////////////////////////////////////////////////////////////////////////////////
// // FILE MARKER - TESTS /////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////

// Deno.test("files_resource_test.ts", async (t) => {
//   await t.step("/files", async (t) => {
//     await t.step("multipart/form-data works", async () => {
//       const server = await runServer();

//       const formData = new FormData();
//       formData.append("value_1", "John");

//       const response = await fetch("http://localhost:3000/files", {
//         method: "POST",
//         body: formData,
//         headers: {
//           Accept: "text/plain",
//         },
//       });
//       assertEquals(await response.text(), "John");

//       await server.close();
//     });
//   });
// });
