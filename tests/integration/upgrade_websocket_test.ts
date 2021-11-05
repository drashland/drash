import { Rhum, TestHelpers } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

const messages: MessageEvent[] = [];
let globalResolve: ((arg: unknown) => void) | null = null;

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends Resource {
  paths = ["/"];

  public GET(request: Request, response: Response) {
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

const server = new Server({
  resources: [
    HomeResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("integration/upgrade_websocket_test.ts", async () => {
  server.run();

  const socket = new WebSocket("ws://localhost:3000");

  const p = new Promise((resolve, reject) => {
    // We pass the `resolve` function to the `r` variable so that the
    // `socket.onmessage()` call in the `GET()` method in the resource can use
    // it to resolve. This makes the `Promise` truly wait until the `messages`
    // array has the message that was sent from the client.
    globalResolve = resolve;
    socket.onopen = () => {
      socket.send("this is a message from the client");
    };
  });

  p.then((messages) => {
    Rhum.asserts.assertEquals(
      (messages as MessageEvent[])[0],
      "this is a message from the client",
    );
  });

  await server.close();
});
