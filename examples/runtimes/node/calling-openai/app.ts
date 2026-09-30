import OpenAI from "openai";
import {
  Application,
  HTTPError,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";
import { Status } from "@drashland/drash/core/http/response/Status.js";
import type { RequestMethod } from "@drashland/drash/core/Types.js";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

// Node has no `URLPattern` and no `Request`, so the chain gets a context object
// you build. It requires `url` and `method`; everything else on it is yours.
type Context = {
  url: string;
  method: RequestMethod;
  request: IncomingMessage;
  response: ServerResponse;
};

const MODEL = "gpt-5";                                 // Any chat model. See
                                                       // platform.openai.com/docs/models.
const client = new OpenAI({                            // Reads the key once, at
  apiKey: process.env.OPENAI_API_KEY,                  // startup.
});

// `IncomingMessage` is a stream, so the body has to be collected before it can
// be parsed. Both resources start here.
async function readPrompt(context: Context): Promise<string> {
  let raw = "";

  for await (const chunk of context.request) {
    raw += chunk;
  }

  let body: { prompt?: unknown };

  try {
    body = JSON.parse(raw);
  } catch {
    throw new HTTPError(Status.BadRequest, "Body must be JSON");
  }

  if (typeof body.prompt !== "string" || body.prompt === "") {
    throw new HTTPError(Status.BadRequest, "Body must have a `prompt` string");
  }

  return body.prompt;
}

// OpenAI's failures are not your caller's failures. Restate each one as the
// status your caller should actually see. Order matters — the specific classes
// come before `APIError`, which is their shared parent.
function openAIErrorToHTTPError(error: unknown): unknown {
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

  public async POST(context: Context) {
    const prompt = await readPrompt(context);

    let completion;

    try {
      completion = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
      });
    } catch (error) {
      throw openAIErrorToHTTPError(error);
    }

    const text = completion.choices[0]?.message.content ?? "";

    context.response.setHeader("content-type", "application/json");
    context.response.end(JSON.stringify({ text }));

    return context.response;                           // Always return something.
  }
}

class ChatStream extends Resource {                    // Answers a piece at a time.
  public paths = ["/chat/stream"];

  public async POST(context: Context) {
    const prompt = await readPrompt(context);          // Throws before anything is
                                                       // written — that matters.
    let stream;

    try {
      stream = await client.chat.completions.create({  // Awaited, so a rejected key
        model: MODEL,                                  // still throws while there is
        messages: [{ role: "user", content: prompt }], // a status code left to send.
        stream: true,
      });
    } catch (error) {
      throw openAIErrorToHTTPError(error);
    }

    context.response.writeHead(200, {                  // Status and headers go out
      "content-type": "text/event-stream",             // now. Nothing after this line
      "cache-control": "no-store",                     // can change them.
      "connection": "keep-alive",
    });

    try {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta.content;  // Empty on the first and last
                                                       // chunks. Skip those.
        if (text) {
          context.response.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      context.response.write("event: done\ndata: {}\n\n");
    } catch (error) {                                  // Too late for a status code.
      context.response.write(                          // Say so in the stream instead.
        `event: error\ndata: ${JSON.stringify({ message: "upstream failed" })}\n\n`,
      );
      console.error(error);
    }

    context.response.end();

    return context.response;
  }
}

const app = Application
  .builder()
  .resources(Chat, ChatStream)
  .build();

const hostname = "localhost";
const port = 1447;

const server = createServer((request, response) => {
  const context = {
    url: `http://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return app
    .handle(context)
    .catch((error) => {
      // `name` is checked before `instanceof` because `instanceof` fails when
      // two copies of Drash end up in one bundle.
      if (error.name === "HTTPError") {
        response.statusCode = error.status_code;
        response.statusMessage = error.status_code_description;
        return response.end(error.message);
      }

      console.error(error);
      response.statusCode = 500;
      response.end("The server could not generate a response");
    });
});

server.listen(port, hostname, () => {
  console.log(`\nDrash running at http://${hostname}:${port}`);
});
