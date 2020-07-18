import {Drash} from "./mod.ts";

await new Drash.Http.Server({
  resources: [
      class Resource extends Drash.Http.Resource {
        static paths = ["/users/:name/:age","/person/:name?/:age?/:city?"]
        public GET() {
          console.log("INNSIDE GET:" + this.request.getPathParam("name"))
          return this.response
        }
      }
  ]
}).run({
  hostname: "localhost",
  port: 1667
});
console.log('running')
