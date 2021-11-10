import { Rhum } from "../deps.ts";
import { buildSchema } from "../deps.ts";
import * as Drash from "../../mod.ts";
import { GraphQLService } from "../../src/services/graphql/graphql.ts";

//
// DATA
//
const schema = buildSchema(`
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
class GraphQLResource extends Drash.Resource {
  paths = ["/graphql"];

  services = {
    ALL: [graphQL],
  };

  // Used purely as an endpoint for the frontend playground
  public GET() {
  }

  // Used purely as an endpoint to make a query from the client
  public POST() {
  }
}

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
      resources: [GraphQLResource],
      protocol: "http",
      port: 1337,
      hostname: "localhost",
    });
    server.run();
    return server;
  }
  if (action === "close" && server) {
    await server.close();
  }
}

//
// TESTS
//
Rhum.testPlan("graphql_test.ts", () => {
  Rhum.testSuite("GraphQL", () => {
    Rhum.testCase(
      "Can respond with a playground when used as middleware",
      async () => {
        const server = await serverAction("run");
        const res = await fetch("http://localhost:1337/graphql");
        await serverAction("close", server);
        const text = await res.text();
        Rhum.asserts.assertEquals(
          text.indexOf("<title>GraphQL Playground</title>") > -1,
          true,
        );
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(res.headers.get("Content-Type"), "text/html");
      },
    );
    Rhum.testCase(
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
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(
          res.headers.get("Content-Type"),
          "application/json",
        );
        Rhum.asserts.assertEquals(json, { data: { hello: "Hello world!" } });
      },
    );
  });
});

Rhum.run();
