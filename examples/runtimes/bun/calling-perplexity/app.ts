import OpenAI from "openai";
import {
  Application,
  HTTPError,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";
import { Status } from "@drashland/drash/core/http/response/Status.js";

const MODEL = "sonar";                                 // `sonar-pro` searches harder
                                                       // and costs more per call.
const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",                // The entire integration.
});

type Source = { title?: string; url: string };

// Perplexity attaches the pages it answered from. The field is not in the
// OpenAI SDK's types — it is a provider extension — so read it off the raw
// object, and accept either of the two shapes the API has used.
function readSources(payload: unknown): Source[] {
  const raw = payload as {
    search_results?: { title?: string; url?: string }[];
    citations?: string[];
  };

  if (Array.isArray(raw?.search_results)) {
    return raw.search_results
      .filter((result): result is Source => typeof result.url === "string")
      .map((result) => ({ title: result.title, url: result.url }));
  }

  if (Array.isArray(raw?.citations)) {
    return raw.citations.map((url) => ({ url }));
  }

  return [];                                           // Some models answer without
}                                                      // searching. Not an error.

// Both resources start here. A `Request` parses its own body, and this throws
// rather than returning an error, which is how a resource reports anything the
// caller got wrong.
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

// These are the SDK's classes, not Perplexity's. They are chosen by HTTP
// status, so they sort an OpenAI-compatible provider's failures just as well.
// Order matters — the specific classes come before `APIError`, their parent.
function apiErrorToHTTPError(error: unknown): unknown {
  if (error instanceof OpenAI.AuthenticationError) {
    return new HTTPError(Status.InternalServerError);  // Your key is wrong.
  }

  if (error instanceof OpenAI.RateLimitError) {
    return new HTTPError(Status.TooManyRequests);      // Pass the limit on.
  }

  if (error instanceof OpenAI.BadRequestError) {
    return new HTTPError(Status.BadRequest);           // Usually the prompt.
  }

  if (error instanceof OpenAI.APIError) {
    return new HTTPError(Status.BadGateway);           // Upstream is down.
  }

  return error;                                        // Not ours. Leave it.
}

class Chat extends Resource {                          // Answers with the whole reply.
  public paths = ["/chat"];

  public async POST(request: Request) {
    const prompt = await readPrompt(request);

    let completion;

    try {
      completion = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
      });
    } catch (error) {
      throw apiErrorToHTTPError(error);
    }

    const text = completion.choices[0]?.message.content ?? "";
    const sources = readSources(completion);

    return Response.json({ text, sources });
  }
}

class ChatStream extends Resource {                    // Answers a piece at a time.
  public paths = ["/chat/stream"];

  public async POST(request: Request) {
    const prompt = await readPrompt(request);          // Throws before the `Response`
                                                       // exists — that matters.
    let stream;

    try {
      stream = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });
    } catch (error) {
      throw apiErrorToHTTPError(error);
    }

    const encoder = new TextEncoder();

    const body = new ReadableStream({
      async start(controller) {
        const send = (frame: string) =>
          controller.enqueue(encoder.encode(frame));

        let sources: Source[] = [];

        try {
          for await (const chunk of stream) {
            const found = readSources(chunk);

            if (found.length > 0) {
              sources = found;
            }

            const text = chunk.choices[0]?.delta.content;

            if (text) {
              send(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }

          send(`event: sources\ndata: ${JSON.stringify({ sources })}\n\n`);
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

const hostname = "localhost";
const port = 1447;

Bun.serve({
  hostname,
  port,
  fetch(request: Request): Promise<Response> {
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

console.log(`\nDrash running at http://${hostname}:${port}`);
