import * as Drash from "../mod.ts";
import { Server } from "../src/http/server.ts";
import { Resource, Service } from "../mod.ts";
class Res extends Resource {
  public services = {
    "GET": [new BeforeMiddleware1()],
  };
  paths = ["/user/:id", "/users/edit/:id?"];
  public GET(context: Drash.Interfaces.Context) {
    context.response.body = "hello";
    console.log(context.request.pathParam("id"));
  }
  public POST(context: Drash.Interfaces.Context) {
    context.response.body = "hello";
  }
}

class BeforeMiddleware1 extends Service implements Drash.Interfaces.IService { // THIS SERVICE remonstrates modifying a response and passing it to the resource
  public runBeforeResource(context: Drash.Interfaces.Context) {
    context.response.headers.set("X-ERIC", "a boss");
  }
}
class BeforeMiddleware2 implements Drash.Interfaces.IService { // THIS MIDDLEWARE demonstrates a service sending a response so a resource is never called.
  public runBeforeResource(context: Drash.Interfaces.Context) {
    if (context.response.headers.get("X-ERIC") === "a boss") {
      // TODO set headers, content type, status and body, send
    }
  }
}
const server = new Server({
  hostname: "localhost",
  port: 1445,
  resources: [Res],
  protocol: "http",
  services: [new BeforeMiddleware1()],
});
console.log("going to run");
server.run();
console.log("running");

// const url = "/2/lon/22/hh".split("/")
// const path = "/:id/:city/:age?".split("/")
// // if url is /, and path is /, its an exACT MATCH
// if (url.join("/") === path.join("/")) {
//   console.log('exact match')
//   Deno.exit()
// }
// const params = new Map()
// // If the url and path dont have the same parts, it isnt meant  to be,
// // eg url = /users or /users/edit/2, and path = /users/:id.
// // Also account for optional params by just ignoring them from this check
// if (url.length !== path.filter(p => p.includes('?') === false).length) {
//   // this will catch when url = /2/lon/22, and path = /:id/:city/:age?
//   // now include optional params and if the len isn't the same, routes deffo dont match
//   if (url.length !== path.length)
//     throw new Error('url doesnt match path')
// }
// // But also check that the url isn't too big for the path, eg
// // url = /users/2/edit/name, path = /users/:id/:action?, those routes dont match
// if (url.length > path.length) {
//   throw new Error('url is too big for path, isnt a match')
// }
// // by now, the url and the path is the same length, BUT could contain different values,
// // eg url = /users/edit/2, path = /users/delete/2
// for (const part in url) {
//   // if part in path isnt a param, it should exactly match the same position in the url, eg
//   // url = /users/edit, path = /users/edit, we're iterating on the second part, both should be "edit",
//   // otherwise url = /users/edit and path = /users/delete shouldn't match right?:)
//   if (path[part].includes(':') === false) {
//     if (url[part] !== path[part]) {
//       throw new Error('this resource isnt for the reuqest')
//     }
//   }

//   //
//   if (path[part].includes(':')) {
//     params.set(path[part].replace(':', ''), url[part])
//   }
// }
// console.log(params)

// for await (const conn of Deno.listen({ port: 4500 })) {
//     (async () => {
//       for await (const { respondWith, request } of Deno.serveHttp(conn)) {
//         //console.log((await request.formData()).get('he'))
//         const form = await request.formData()
//         const formDataJSON: any = {};
//         for (const [key, value] of form.entries()) {
//         formDataJSON[key] = value;
//                 }

//                 console.log(formDataJSON)
//         respondWith(new Response("Hello World"));
//       }
//     })();
//   }
