import members from "../../members.ts";

class HomeResource extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "got";
    return this.response;
  }
  public POST() {
    this.response.body = "got this";
    return this.response;
  }
}

class UserResource extends members.Drash.Http.Resource {
  static paths = ["/user/:id", "/user/:id/"];
  public GET() {
    this.response.body = {};
    return this.response;
  }
}

class MyBeforeRequestResource extends members.Drash.Http.Resource {
  static paths = ["/"];
  public hook_beforeRequest() {
    this.response.body = 'hello';
  }
  public GET() {
    this.response.body += ", world";
    return this.response;
  }
}

class MyAfterRequestResource extends members.Drash.Http.Resource {
  static paths = ["/"];
  public hook_afterRequest() {
    this.response.body += ', world';
  }
  public GET() {
    this.response.body = "hello";
    return this.response;
  }
}

class MyBeforeAndAfterRequestResource extends members.Drash.Http.Resource {
  static paths = ["/"];
  public hook_afterRequest() {
    this.response.body += ' I am the after hook.';
  }
  public hook_beforeRequest() {
    this.response.body = 'I am the before hook.';
  }
  public GET() {
    this.response.body += " I am the GET method.";
    return this.response;
  }
}

// TODO(crookse)
//     [ ] test request.body_parsed
//     [ ] test favicon.ico request
// members.test(async function Server_handleHttpRequest() {
//   let request;
//   let response;
//   let server = new members.Drash.Http.Server({
//     resources: [HomeResource]
//   });

//   request = members.mockRequest();
//   response = await server.handleHttpRequest(request);

//   members.assert.equal(
//     members.decoder.decode(response.body),
//     `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
//   );

//   request = members.mockRequest("/", "POST");
//   response = await server.handleHttpRequest(request);
//   members.assert.equal(
//     members.decoder.decode(response.body),
//     `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"POST"},"body":"got this"}`
//   );
// });

// members.test(async function Server_handleHttpRequest_hook_beforeRequest() {
//   let request;
//   let response;
//   let server = new members.Drash.Http.Server({
//     resources: [MyBeforeRequestResource]
//   });

//   request = members.mockRequest();
//   response = await server.handleHttpRequest(request);

//   members.assert.equal(
//     members.decoder.decode(response.body),
//     `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"hello, world"}`
//   );
// });

// members.test(async function Server_handleHttpRequest_hook_afterRequest() {
//   let request;
//   let response;
//   let server = new members.Drash.Http.Server({
//     resources: [MyAfterRequestResource]
//   });

//   request = members.mockRequest();
//   response = await server.handleHttpRequest(request);

//   members.assert.equal(
//     members.decoder.decode(response.body),
//     `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"hello, world"}`
//   );
// });

// members.test(async function Server_handleHttpRequest_hook_beforeAnAfterRequest() {
//   let request;
//   let response;
//   let server = new members.Drash.Http.Server({
//     resources: [MyBeforeAndAfterRequestResource]
//   });

//   request = members.mockRequest();
//   response = await server.handleHttpRequest(request);

//   members.assert.equal(
//     members.decoder.decode(response.body),
//     `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"I am the before hook. I am the GET method. I am the after hook."}`
//   );
// });

// members.test(async function Server_handleHttpRequestError() {
//   let request;
//   let response;
//   let server = new members.Drash.Http.Server({
//     resources: [UserResource]
//   });

//   request = members.mockRequest();
//   response = await server.handleHttpRequest(request);
//   members.assert.equal(
//     members.decoder.decode(response.body),
//     `{"status_code":404,"status_message":"Not Found","request":{"url":"/","method":"GET"},"body":"The requested URL '/' was not found on this server."}`
//   );

//   request = members.mockRequest("/user/1", "POST");
//   response = await server.handleHttpRequest(request);
//   members.assert.equal(
//     members.decoder.decode(response.body),
//     `{"status_code":405,"status_message":"Method Not Allowed","request":{"url":"/user/1","method":"POST"},"body":"URI '/user/1' does not allow POST requests."}`
//   );
// });
