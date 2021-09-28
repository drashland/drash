import { Server, Resource, IResource, IContext } from "./mod.ts"

class Res extends Resource implements IResource {
     paths = ["/"]

     GET(context: IContext) {
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