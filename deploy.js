import { Server, IContext, Resource, IResource } from "./mod.ts"

class Res extends Resource implements IResource {
    public paths = ["/"]

    public GET(context: IContext) {
        console.log('hello')
        context.response.text("hi fromres :)")
    }
}

const server = new Server({
    protocol: "http",
    port: 1334,
    hostname: "localhost",
    resources: [Res]
})

server.run()
console.log('running')
const res = await fetch("http://localhost:1334")
console.log(await res.text())