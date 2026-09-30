import Anthropic from "@anthropic-ai/sdk";
import {
  Application,
  HTTPError,
  Resource,
} from "@drashland/drash/modules/http.native.js";
import { Status } from "@drashland/drash/core/http/response/Status.js";

const MODEL = "claude-opus-5";

// No module-scoped client here. A Worker's secrets arrive as an argument to
// `fetch`, so there is nothing to read at startup — see "Getting the API Key to
// the Resource" below.

// Both resources start here. A `Request` parses its own body, so this is the
// same function the Deno and Bun builds use.
async function readPrompt(request) {
  let body;

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
function anthropicErrorToHTTPError(error) {
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
  paths = ["/chat"];

  async POST(context) {                                // A context object, not a bare
    const prompt = await readPrompt(context.request);  // `Request` — it has to
                                                       // carry `env` too.
    const client = new Anthropic({ apiKey: context.env.ANTHROPIC_API_KEY });

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

    return Response.json({ text });
  }
}

class ChatStream extends Resource {                    // Answers a piece at a time.
  paths = ["/chat/stream"];

  async POST(context) {
    const prompt = await readPrompt(context.request);  // Throws before the
                                                       // `Response` exists.
    const client = new Anthropic({ apiKey: context.env.ANTHROPIC_API_KEY });

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();

    const body = new ReadableStream({
      async start(controller) {
        const send = (frame) => controller.enqueue(encoder.encode(frame));

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

    return new Response(body, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-store",
      },
    });
  }
}

const app = Application
  .builder()
  .resources(Chat, ChatStream)
  .build();

export default {
  fetch(request, env) {
    // The chain requires `url` and `method`. The rest of this object is
    // yours to define, which is how `env` reaches the resource.
    const context = {
      url: request.url,
      method: request.method,
      request,
      env,
    };

    return app
      .handle(context)
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
};
