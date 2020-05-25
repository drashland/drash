import { Drash } from '../../deps.ts'
import { assertEquals } from "../../deps.ts"
import HomeResource from '../../resources/home_resource.ts';

Deno.test({
    name: 'HomeResource - GET /',
    async fn(): Promise<void> {
        const server = new Drash.Http.Server({
            address: "localhost:1557",
            resources: [HomeResource]
        });
        await server.run()
        const response = await fetch('http://localhost:1557')
        assertEquals(response.status, 200)
        server.close()
    })
});