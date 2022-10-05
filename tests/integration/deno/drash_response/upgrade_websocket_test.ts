import { assertEquals, Drash, TestHelpers } from "../deps.ts";

const messages: MessageEvent[] = [];
let globalResolve: ((arg: unknown) => void) | null = null;

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class WebSocketResource extends Drash.Resource {
  paths = ["/get-web-socket"];

  public GET(request: Drash.Request, response: Drash.Response) {
    const {
      socket,
      response: upgradedResponse,
    } = Deno.upgradeWebSocket(request);

    socket.onmessage = (message) => {
      messages.push(message.data);
      if (globalResolve) {
        globalResolve(messages);
      }
    };

    return response.upgrade(upgradedResponse);
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const drashRequestHandler = await Drash.createRequestHandler({
    resources: [WebSocketResource],
  });

  const denoRequestHandler = (request: Request) => {
    return drashRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(3000)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("integration/upgrade_websocket_test.ts", async () => {
  const server = await runServer();

  const socket = new WebSocket("ws://localhost:3000/get-web-socket");

  const hydratedMessages = await new Promise((resolve, _reject) => {
    // We pass the `resolve` function to the `globalResolve` variable so that
    // the `socket.onmessage()` call in the `GET()` method in the resource can
    // use it to resolve the `Promise`. This makes the `Promise` truly wait
    // until the `messages` array has the message that was sent from the client.
    globalResolve = resolve;
    socket.onopen = () => {
      socket.send("this is a message from the client");
      // Close the connection so that this test doesn't leak async ops
      socket.close();
    };
  });

  assertEquals<string>(
    (hydratedMessages as MessageEvent[])[0] as unknown as string,
    "this is a message from the client",
  );

  await server.close();
});
