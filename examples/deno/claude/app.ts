import Anthropic from "npm:@anthropic-ai/sdk";
import {
  Application,
  HTTPError,
  Resource,
} from "jsr:@drashland/drash/modules/http.native";
import { Status } from "jsr:@drashland/drash/core/http/response/Status";
 
const MODEL = "claude-opus-5";
 
const client = new Anthropic({                         // `--allow-env` is what lets
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),           // this read the key.
});
 
// Both resources start here. A `Request` parses its own body, so this is
// shorter than the Node version — and it throws rather than returning an error,
// which is how a resource reports anything the caller got wrong.
async function readPrompt(request: Request): Promise<string> {
  let body: { prompt?: unknown };
 
  try {
    body = await request.json();
  } catch {
    throw new HTTPError(Status.BadRequest, "Body must be JSON");
  }
 
  if (typeof body.prompt !== "string" || body.prompt === "") {
    throw new HTTPError(Status.BadRequest, "Body must have a `prompt` string");
  }
 
  return body.prompt;
}
 
// Anthropic's failures are not your caller's failures. Restate each one as the
// status your caller should actually see. Order matters — the specific classes
// come before `APIError`, which is their shared parent.
function anthropicErrorToHTTPError(error: unknown): unknown {
  if (error instanceof Anthropic.AuthenticationError) {
    return new HTTPError(Status.InternalServerError);  // Your key is wrong.
  }
 
  if (error instanceof Anthropic.RateLimitError) {
    return new HTTPError(Status.TooManyRequests);      // Pass the limit on.
  }
 
  if (error instanceof Anthropic.BadRequestError) {
    return new HTTPError(Status.BadRequest);           // Usually the prompt.
  }
 
  if (error instanceof Anthropic.APIError) {
    return new HTTPError(Status.BadGateway);           // Upstream is down.
  }
 
  return error;                                        // Not ours. Leave it.
}
 
class Chat extends Resource {                          // Answers with the whole reply.
  public paths = ["/chat"];
 
  public async POST(request: Request) {
    const prompt = await readPrompt(request);
 
    let message;
 
    try {
      message = await client.messages.create({
        model: MODEL,
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      });
    } catch (error) {
      throw anthropicErrorToHTTPError(error);
    }
 
    const text = message.content                       // `content` holds blocks of
      .filter((block) => block.type === "text")        // several types. Keep the text
      .map((block) => block.text)                      // ones before reading `.text`.
      .join("");
 
    return Response.json({ text });                    // Whatever you return is what
  }                                                    // `app.handle()` resolves with.
}
 
class ChatStream extends Resource {                    // Answers a piece at a time.
  public paths = ["/chat/stream"];
 
  public async POST(request: Request) {
    const prompt = await readPrompt(request);          // Throws before the `Response`
                                                       // exists — that matters.
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      messages: [{ role: "user", content: prompt }],
    });
 
    const encoder = new TextEncoder();
 
    const body = new ReadableStream({
      async start(controller) {
        const send = (frame: string) =>
          controller.enqueue(encoder.encode(frame));
 
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              send(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
            }
          }
 
          send("event: done\ndata: {}\n\n");
        } catch (error) {                              // Too late for a status code.
          send(                                        // Say so in the stream instead.
            `event: error\ndata: ${
              JSON.stringify({ message: "upstream failed" })
            }\n\n`,
          );
          console.error(error);
        } finally {
          controller.close();
        }
      },
    });
 
    return new Response(body, {                        // A streamed body is still just
      headers: {                                       // a `Response`. Drash passes it
        "content-type": "text/event-stream",           // through untouched.
        "cache-control": "no-store",
      },
    });
  }
}
 
const app = Application
  .builder()
  .resources(Chat, ChatStream)
  .build();
 
const hostname = "localhost";
const port = 1447;
 
Deno.serve({
  hostname,
  port,
  onListen: ({ hostname, port }) => {
    console.log(`\nDrash running at http://${hostname}:${port}`);
  },
  handler: (request: Request): Promise<Response> => {
    return app
      .handle<Response>(request)
      .catch((error) => {
        // `name` is checked before `instanceof` because `instanceof` fails when
        // two copies of Drash end up in one bundle.
        if (error.name === "HTTPError") {
          return new Response(error.message, {
            status: error.status_code,
            statusText: error.status_code_description,
          });
        }
 
        console.error(error);
 
        return new Response("The server could not generate a response", {
          status: 500,
        });
      });
  },
});
