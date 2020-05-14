// import members from "../../members.ts";
// import { Drash } from "../../../mod.ts";

/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMiddlewareBeforeClass: header not specified", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMiddlewareBeforeClass],
//   });

//   const port = 10000;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`);

//   members.assert.equals(await response.json(), "'header' not specified.");

//   server.close();
// });
/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMiddlewareBeforeClass: valid", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMiddlewareBeforeClass],
//   });

//   const port = 10001;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`, {
//     headers: {
//       csrf_token: "all your base",
//     },
//   });

//   members.assert.equals(await response.json(), { name: "Thor" });

//   server.close();
// });

/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMultipleMiddlewareBeforeClass: correct header, custom response and value", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMultipleMiddlewareBeforeClass],
//   });

//   const port = 10002;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`, {
//     headers: {
//       csrf_token: "all your base",
//     },
//   });

//   members.assert.equals(await response.json(), { name: "Thor" });
//   members.assert.equals(response.headers.get("MYCUSTOM"), "hey");

//   server.close();
// });

/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMultipleMiddlewareAfterClass: response is html, custom header and value", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMultipleMiddlewareAfterClass],
//   });

//   const port = 10003;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`, {
//     headers: {
//       csrf_token: "all your base",
//     },
//   });

//   members.assert.equals(await response.text(), "<h1>hey</h1>");
//   members.assert.equals(response.headers.get("Content-Type"), "text/html");
//   members.assert.equals(response.headers.get("MYCUSTOM"), "hey");

//   server.close();
// });
/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMiddlewareClass: custom header and swap to html", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMiddlewareClass],
//   });

//   const port = 10004;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`, {
//     headers: {
//       csrf_token: "all your base",
//     },
//   });

//   members.assert.equals(await response.text(), "<h1>hey</h1>");
//   members.assert.equals(response.headers.get("Content-Type"), "text/html");
//   members.assert.equals(response.headers.get("MYCUSTOM"), "hey");

//   server.close();
// });
/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMiddlewareBeforeMethod: custom header", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMiddlewareBeforeMethod],
//   });

//   const port = 10005;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`, {
//     headers: {
//       csrf_token: "all your base",
//     },
//   });

//   members.assert.equals(await response.json(), { name: "Thor" });

//   server.close();
// });
/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMultipleMiddlewareBeforeMethod: custom header", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMultipleMiddlewareBeforeMethod],
//   });

//   const port = 10006;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`, {
//     headers: {
//       csrf_token: "all your base",
//     },
//   });

//   members.assert.equals(await response.json(), { name: "Thor" });
//   members.assert.equals(response.headers.get("MYCUSTOM"), "hey");

//   server.close();
// });
/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMiddlewareAfterMethod: swap to html", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMiddlewareAfterMethod],
//   });

//   const port = 10007;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`, {
//     headers: {
//       csrf_token: "all your base",
//     },
//   });

//   members.assert.equals(await response.text(), "<h1>hey</h1>");
//   members.assert.equals(response.headers.get("Content-Type"), "text/html");

//   server.close();
// });
/**
 * @covers Server.handleHttpRequest()
 */
// members.test("middleware_test.ts | ResourceWithMultipleMiddlewareAfterMethod: custom header and swap to html", async () => {
//   let server = new members.MockServer({
//     resources: [ResourceWithMultipleMiddlewareAfterMethod],
//   });

//   const port = 10008;
//   server.run({
//     hostname: "localhost",
//     port: port,
//   });

//   let response = await members.fetch.get(`http://localhost:${port}/users/1`, {
//     headers: {
//       csrf_token: "all your base",
//     },
//   });

//   members.assert.equals(await response.text(), "<h1>hey</h1>");
//   members.assert.equals(response.headers.get("Content-Type"), "text/html");
//   members.assert.equals(response.headers.get("MYCUSTOM"), "hey");

//   server.close();
// });
// ////////////////////////////////////////////////////////////////////////////////
// // DATA ////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////

// function CustomHeader(
//   request: any,
//   response: Drash.Http.Response,
// ) {
//   if (request.getHeaderParam("csrf_token") == null) {
//     throw new Drash.Exceptions.HttpMiddlewareException(
//       400,
//       "'header' not specified.",
//     );
//   }
// }
// function SwapResponseToHtml(
//   request: any,
//   response: Drash.Http.Response,
// ) {
//   response.headers.set("Content-Type", "text/html");
//   response.body = "<h1>hey</h1>";
// }
// function ResponseCustomHeaderAdded(
//   request: any,
//   response: Drash.Http.Response,
// ) {
//   response.headers.set("MYCUSTOM", "hey");
// }

// @Drash.Http.Middleware({ before_request: [CustomHeader] })
// class ResourceWithMiddlewareBeforeClass extends members.Drash.Http.Resource {
//   static paths = ["/users/:id", "/users/:id/"];
//   public users: any = {
//     1: {
//       name: "Thor",
//     },
//     2: {
//       name: "Hulk",
//     },
//   };
//   public GET() {
//     this.response.body = this.users[this.request.getPathParam("id")];
//     return this.response;
//   }
// }

// @Drash.Http.Middleware(
//   { before_request: [ResponseCustomHeaderAdded, CustomHeader] },
// )
// class ResourceWithMultipleMiddlewareBeforeClass
//   extends members.Drash.Http.Resource {
//   static paths = ["/users/:id", "/users/:id/"];
//   public users: any = {
//     1: {
//       name: "Thor",
//     },
//     2: {
//       name: "Hulk",
//     },
//   };
//   public GET() {
//     this.response.body = this.users[this.request.getPathParam("id")];
//     return this.response;
//   }
// }

// @Drash.Http.Middleware(
//   { after_request: [SwapResponseToHtml, ResponseCustomHeaderAdded] },
// )
// class ResourceWithMultipleMiddlewareAfterClass
//   extends members.Drash.Http.Resource {
//   static paths = ["/users/:id", "/users/:id/"];
//   public users: any = {
//     1: {
//       name: "Thor",
//     },
//     2: {
//       name: "Hulk",
//     },
//   };
//   public GET() {
//     return this.response;
//   }
// }

// @Drash.Http.Middleware(
//   {
//     before_request: [SwapResponseToHtml],
//     after_request: [ResponseCustomHeaderAdded],
//   },
// )
// class ResourceWithMiddlewareClass extends members.Drash.Http.Resource {
//   static paths = ["/users/:id", "/users/:id/"];
//   public users: any = {
//     1: {
//       name: "Thor",
//     },
//     2: {
//       name: "Hulk",
//     },
//   };
//   public GET() {
//     return this.response;
//   }
// }

// class ResourceWithMiddlewareBeforeMethod extends members.Drash.Http.Resource {
//   static paths = ["/users/:id", "/users/:id/"];
//   public users: any = {
//     1: {
//       name: "Thor",
//     },
//     2: {
//       name: "Hulk",
//     },
//   };
//   @Drash.Http.Middleware({ before_request: [CustomHeader] })
//   public GET() {
//     this.response.body = this.users[this.request.getPathParam("id")];
//     return this.response;
//   }
// }

// class ResourceWithMiddlewareAfterMethod extends members.Drash.Http.Resource {
//   static paths = ["/users/:id", "/users/:id/"];
//   public users: any = {
//     1: {
//       name: "Thor",
//     },
//     2: {
//       name: "Hulk",
//     },
//   };
//   @Drash.Http.Middleware({ after_request: [SwapResponseToHtml] })
//   public GET() {
//     return this.response;
//   }
// }

// class ResourceWithMultipleMiddlewareBeforeMethod
//   extends members.Drash.Http.Resource {
//   static paths = ["/users/:id", "/users/:id/"];
//   public users: any = {
//     1: {
//       name: "Thor",
//     },
//     2: {
//       name: "Hulk",
//     },
//   };
//   @Drash.Http.Middleware(
//     { before_request: [ResponseCustomHeaderAdded, CustomHeader] },
//   )
//   public GET() {
//     this.response.body = this.users[this.request.getPathParam("id")];
//     return this.response;
//   }
// }

// class ResourceWithMultipleMiddlewareAfterMethod
//   extends members.Drash.Http.Resource {
//   static paths = ["/users/:id", "/users/:id/"];
//   public users: any = {
//     1: {
//       name: "Thor",
//     },
//     2: {
//       name: "Hulk",
//     },
//   };
//   @Drash.Http.Middleware(
//     { after_request: [SwapResponseToHtml, ResponseCustomHeaderAdded] },
//   )
//   public GET() {
//     return this.response;
//   }
// }
