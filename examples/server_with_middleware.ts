
import * as Drash from "../mod.ts"
import { Server } from "../src/http/server.ts"
class Res extends Drash.DrashResource {
    static paths = ["/", "/:id"]
    public GET() {
        this.response.body = "hello"
        this.pathParam('')
        return this.response
    }
}

class BeforeMiddleware1 extends Drash.Service { // THIS SERVICE remonstrates modifying a response and passing it to the resource
  public run (request: Drash.DrashRequest, response: Drash.DrashResponse) {
    response.headers.set("X-ERIC", "a boss")
  }
}
class BeforeMiddleware2 extends Drash.Service { // THIS MIDDLEWARE demonstrates a service sending a response so a resource is never called. 
  public run (request: Drash.DrashRequest, response: Drash.DrashResponse) {
    if (response.headers.get("X-ERIC") === "a boss") {
      // TODO set headers, content type, status and body, send
    }
  }
}
const server = new Server({
    hostname: "localhost",
    port: 1445,
    resources: [Res],
    protocol: "http",
    services: {
      before_request: [BeforeMiddleware1]
    }
})
console.log('going to run')
server.run()
console.log('running')

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