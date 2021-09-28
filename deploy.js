import { Server, Resource } from "./mod.ts"

class Res extends Resource {
     paths = ["/"]

     GET(context) {
        context.response.text("hi fromres :)")
    }
}

const server = new Server({
    protocol: "http",
    port: 1334,
    hostname: "localhost",
    resources: [Res]
})

server.runDeploy()