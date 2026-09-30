import Anthropic from "@anthropic-ai/sdk";
import {
  Application,
  HTTPError,
  Resource,
} from "@drashland/drash/modules/http.polyfill.js";
import { Status } from "@drashland/drash/core/http/response/Status.js";
import { DEFAULT_MODEL, isModel, type Model } from "@/app/models";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type Turn = { role: "user" | "assistant"; content: string };

// The API keeps no state between calls, so something has to hold the
// conversation and send all of it every time. Here that is the server: one
// list of turns per conversation, in memory. A restart forgets them all, and
// serverless instances do not share memory, so a real deployment keeps these
// in a database or a key-value store instead.
const conversations = new Map<string, Turn[]>();

const COOKIE = "conversation";

// The browser holds only an ID, in a cookie, and sends it back on its own.
// `HttpOnly` keeps page scripts from reading it.
function openConversation(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const found = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1];
  const id = found ?? crypto.randomUUID();

  const headers: Record<string, string> = found        // Only a new conversation
    ? {}                                               // needs the cookie set.
    : { "set-cookie": `${COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax` };

  return { id, turns: conversations.get(id) ?? [], headers };
}

// Stores the prompt and the reply together, and only once the reply is done.
// A failed request leaves no trace, so the next one never sends Claude a
// question that was never answered.
function remember(id: string, turns: Turn[], prompt: string, reply: string) {
  if (reply === "") {                                  // The API rejects an empty
    return;                                            // turn, so storing one would
  }                                                    // break every later request.

  conversations.set(id, [
    ...turns,
    { role: "user", content: prompt },
    { role: "assistant", content: reply },
  ]);
}

// Both chat resources start here. A route handler is handed a Web `Request`,
// which parses its own body.
async function readRequest(
  request: Request,
): Promise<{ prompt: string; model: Model }> {
  let body: { prompt?: unknown; model?: unknown };

  try {
    body = await request.json();
  } catch {
    throw new HTTPError(Status.BadRequest, "Body must be JSON");
  }

  if (typeof body.prompt !== "string" || body.prompt === "") {
    throw new HTTPError(Status.BadRequest, "Body must have a `prompt` string");
  }

  const model = body.model ?? DEFAULT_MODEL;           // The browser picks from a
                                                       // list, but nothing stops a
  if (!isModel(model)) {                               // caller sending any string.
    throw new HTTPError(Status.BadRequest, "Unknown model");
  }

  return { prompt: body.prompt, model };
}

// Anthropic's failures are not your caller's failures. Restate each one as the
// status your caller should actually see, with a reason a person can act on.
// Order matters — the specific classes come before `APIError`, which is their
// shared parent.
function anthropicErrorToHTTPError(error: unknown): unknown {
  if (error instanceof Anthropic.AuthenticationError) {
    return new HTTPError(                              // Your key is wrong. The
      Status.InternalServerError,                      // caller cannot fix that.
      "The server's Anthropic API key was rejected.",
    );
  }

  if (error instanceof Anthropic.RateLimitError) {
    return new HTTPError(                              // Pass the limit on.
      Status.TooManyRequests,
      "Too many requests right now. Wait a moment, then try again.",
    );
  }

  if (error instanceof Anthropic.NotFoundError) {
    return new HTTPError(                              // A model this key has no
      Status.BadRequest,                               // access to.
      "That model is not available to this server's API key.",
    );
  }

  if (error instanceof Anthropic.BadRequestError) {
    return new HTTPError(                              // Usually the prompt.
      Status.BadRequest,
      "Claude could not accept that request. The conversation may be too long.",
    );
  }

  if (error instanceof Anthropic.APIError) {
    return new HTTPError(                              // Upstream is down.
      Status.BadGateway,
      "Claude could not be reached. Try again in a moment.",
    );
  }

  return error;                                        // Not ours. Leave it.
}

// Claude can search the web and read pages, but only with tools it is given.
// Both run on Anthropic's servers: the reply comes back with the browsing
// already done, so nothing on this server fetches anything. Haiku 4.5 takes the
// older versions. The newer ones let Claude filter results with code before
// reading them, which spends fewer tokens. `max_uses` caps the cost per reply.
function webTools(model: Model): Anthropic.Messages.ToolUnion[] {
  if (model === "claude-haiku-4-5") {
    return [
      { type: "web_search_20250305", name: "web_search", max_uses: 5 },
      { type: "web_fetch_20250910", name: "web_fetch", max_uses: 5 },
    ];
  }

  return [
    { type: "web_search_20260209", name: "web_search", max_uses: 5 },
    { type: "web_fetch_20260209", name: "web_fetch", max_uses: 5 },
  ];
}

// Browsing runs as a loop on Anthropic's side, and a long one stops partway
// with `stop_reason: "pause_turn"`. Sending the reply so far back picks it up
// where it stopped. This caps how many times that happens for one prompt.
const MAX_CONTINUATIONS = 3;

// Search results come back as citations on the text that used them. Anything
// that shows web search results has to show where they came from, so they are
// listed under the reply. Brackets would end the link text early.
type Sources = Map<string, string>;                    // URL → page title.

function collect(sources: Sources, citation: Anthropic.TextCitation) {
  if (citation.type === "web_search_result_location") {
    sources.set(citation.url, citation.title ?? citation.url);
  }
}

function listSources(sources: Sources): string {
  if (sources.size === 0) {
    return "";
  }

  const links = [...sources].map(
    ([url, title]) => `- [${title.replace(/[[\]]/g, "\\$&")}](${url})`,
  );

  return `\n\n**Sources**\n\n${links.join("\n")}`;
}

// A reply is several text blocks when Claude writes, searches, then writes
// again. Joined as-is, "Let me check." runs straight into the answer, so a
// paragraph break goes wherever text resumes after something that was not
// text. Adjacent text blocks are one sentence split by citations; they join
// with nothing.
const resumes = (previous: string, reply: string) =>
  previous !== "text" && reply !== "" ? "\n\n" : "";

// A refusal is not an exception. The API answers `200` and says so in
// `stop_reason`, so it is checked for and turned into one.
const refused = () =>
  new HTTPError(
    Status.UnprocessableEntity,
    "Claude declined to answer that prompt.",
  );

class Conversation extends Resource {                  // The page reads the thread
  public paths = ["/api/conversation"];                // back from here on load.

  public GET(request: Request) {
    const { turns } = openConversation(request);

    return Response.json({ messages: turns });
  }

  public DELETE(request: Request) {                    // Starts over. The cookie
    const { id } = openConversation(request);          // stays; its history goes.

    conversations.delete(id);

    return new Response(null, { status: 204 });
  }
}

class Chat extends Resource {                          // Answers with the whole reply.
  public paths = ["/api/chat"];                        // The URL the browser asks
                                                       // for, not a path relative
  public async POST(request: Request) {                // to the handler.
    const { prompt, model } = await readRequest(request);
    const { id, turns, headers } = openConversation(request);

    const messages: Anthropic.MessageParam[] = [
      ...turns,
      { role: "user", content: prompt },
    ];
    const sources: Sources = new Map();
    let text = "";
    let previous = "";

    for (let round = 0; ; round++) {
      let message;

      try {
        message = await client.messages.create({
          model,
          max_tokens: 16000,
          tools: webTools(model),
          messages,
        });
      } catch (error) {
        throw anthropicErrorToHTTPError(error);
      }

      if (message.stop_reason === "refusal") {
        throw refused();
      }

      for (const block of message.content) {           // `content` holds blocks of
        if (block.type === "text") {                   // several types: searches,
          text += resumes(previous, text) + block.text;// their results, and text.
          block.citations?.forEach((citation) => collect(sources, citation));
        }

        previous = block.type;
      }

      if (message.stop_reason !== "pause_turn" || round === MAX_CONTINUATIONS) {
        break;
      }

      messages.push({ role: "assistant", content: message.content });
    }

    text += listSources(sources);

    remember(id, turns, prompt, text);

    return Response.json({ text }, { headers });
  }
}

class ChatStream extends Resource {                    // Answers a piece at a time.
  public paths = ["/api/chat/stream"];

  public async POST(request: Request) {
    // Read and checked before the `Response` exists — that matters.
    const { prompt, model } = await readRequest(request);
    const { id, turns, headers } = openConversation(request);

    const messages: Anthropic.MessageParam[] = [
      ...turns,
      { role: "user", content: prompt },
    ];

    const encoder = new TextEncoder();

    const body = new ReadableStream({
      async start(controller) {
        const send = (frame: string) =>
          controller.enqueue(encoder.encode(frame));

        let reply = "";                                // Collected as it goes out,
                                                       // so it can be stored once
        const write = (text: string) => {              // the stream is done.
          if (text === "") {
            return;
          }

          reply += text;
          send(`data: ${JSON.stringify({ text })}\n\n`);
        };

        const sources: Sources = new Map();
        let previous = "";

        try {
          for (let round = 0; ; round++) {
            const stream = client.messages.stream({
              model,
              max_tokens: 64000,
              tools: webTools(model),
              messages,
            });

            for await (const event of stream) {
              if (event.type === "content_block_start") {
                const block = event.content_block;

                if (block.type === "text") {
                  write(resumes(previous, reply));
                }

                if (block.type === "server_tool_use") {// A search can take several
                  const text = block.name === "web_fetch" // seconds with no text, so
                    ? "Reading a page"                 // say what is happening.
                    : "Searching the web";

                  send(`event: activity\ndata: ${JSON.stringify({ text })}\n\n`);
                }

                previous = block.type;
              }

              if (event.type === "content_block_delta") {
                if (event.delta.type === "text_delta") {
                  write(event.delta.text);
                }

                if (event.delta.type === "citations_delta") {
                  collect(sources, event.delta.citation);
                }
              }

              if (
                event.type === "message_delta" &&
                event.delta.stop_reason === "refusal"
              ) {
                throw refused();                       // Any text already sent is
              }                                        // dropped by the page.
            }

            const message = await stream.finalMessage();

            if (
              message.stop_reason !== "pause_turn" ||
              round === MAX_CONTINUATIONS
            ) {
              break;
            }

            messages.push({ role: "assistant", content: message.content });
          }

          write(listSources(sources));
          remember(id, turns, prompt, reply);
          send("event: done\ndata: {}\n\n");
        } catch (error) {                              // Too late for a status code.
          const failure = anthropicErrorToHTTPError(error);
          const message = failure instanceof HTTPError // Say so in the stream
            ? failure.message                          // instead, with the same
            : "The reply stopped partway through.";    // reason /api/chat gives.

          send(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
          console.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        ...headers,
        "content-type": "text/event-stream",
        "cache-control": "no-store",
        "x-accel-buffering": "no",                     // Stops a reverse proxy from
      },                                               // holding frames back.
    });
  }
}

const app = Application
  .builder()
  .resources(Conversation, Chat, ChatStream)
  .build();

function handle(request: Request): Promise<Response> {
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
}

// Next.js dispatches on the export name, so every method the chain should see
// needs one. All of them hand the request straight to the same application.
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

export async function DELETE(request: Request) {
  return handle(request);
}
