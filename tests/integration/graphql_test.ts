import { assertEquals } from "../deps.ts";
import * as Drash from "../../mod.ts";
import { GraphQL, GraphQLService } from "../../src/services/graphql/graphql.ts";

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

async function serverAction(
  action: "close",
  server: Drash.Server,
): Promise<void>;

async function serverAction(action: "run"): Promise<Drash.Server>;

async function serverAction(
  action: "run" | "close",
  server?: Drash.Server,
): Promise<Drash.Server | void> {
  if (action === "run") {
    const server = new Drash.Server({
      resources: [],
      protocol: "http",
      port: 1337,
      hostname: "localhost",
      services: [graphQL]
    });
    server.run();
    return server;
  }
  if (action === "close" && server) {
    await server.close();
  }
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("graphql_test.ts", async (t) => {
  await t.step("GraphQL", async (t) => {
    await t.step(
      "Can respond with a playground when used as middleware",
      async () => {
        const server = await serverAction("run");
        const res = await fetch("http://localhost:1337/graphql");
        await serverAction("close", server);
        const text = await res.text();
        assertEquals(
          text.indexOf("<title>GraphQL Playground</title>") > -1,
          true,
        );
        assertEquals(res.status, 200);
        assertEquals(res.headers.get("Content-Type"), "text/html");
      },
    );
    await t.step(
      "Will make a query on a request when used as middleware",
      async () => {
        const server = await serverAction("run");
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
        await serverAction("close", server);
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
