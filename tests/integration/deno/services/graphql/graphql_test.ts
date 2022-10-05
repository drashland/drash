import { assertEquals, Drash, TestHelpers } from "../../deps.ts";
import {
  GraphQL,
  GraphQLService,
} from "../../../../../services/deno/graphql/graphql.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TEST DATA /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const schema = GraphQL.buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
  hello: () => {
    return "Hello world!";
  },
};

const graphQL = new GraphQLService({ schema, graphiql: true, rootValue: root });

async function runServer(): Promise<TestHelpers.DrashServer> {
  const drashRequestHandler = await Drash.createRequestHandler({
    services: [graphQL],
  });

  const denoRequestHandler = (request: Request) => {
    return drashRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(1337)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("graphql_test.ts", async (t) => {
  await t.step("GraphQL", async (t) => {
    // await t.step(
    //   "Can respond with a playground when used as middleware",
    //   async () => {
    //     const server = await runServer();
    //     const res = await fetch("http://localhost:1337/graphql");
    //     const text = await res.text();
    //     await server.close();
    //     assertEquals(
    //       text.indexOf("<title>GraphQL Playground</title>") > -1,
    //       true,
    //     );
    //     assertEquals(res.status, 200);
    //     assertEquals(res.headers.get("Content-Type"), "text/html");
    //   },
    // );
    await t.step(
      "Will make a query on a request when used as middleware",
      async () => {
        const server = await runServer();
        const res = await fetch("http://localhost:1337/graphql", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: "{ hello }",
          }),
        });
        await server.close();
        const json = await res.json();
        assertEquals(res.status, 200);
        assertEquals(
          res.headers.get("Content-Type"),
          "application/json",
        );
        assertEquals(json, { data: { hello: "Hello world!" } });
      },
    );
  });
});
