import {
  createMcpHandler,
  McpServer,
  ResourceTemplate,
} from "npm:@modelcontextprotocol/server@2";
import * as z from "npm:zod@^4/v4";
import { NOTES } from "./notes.ts";

// The SDK builds a fresh server per request, which is why this is a factory.
export const handler = createMcpHandler(() => {
  const server = new McpServer({ name: "drash-notes", version: "1.0.0" });

  server.registerTool(
    "save_note",
    {
      description: "Save a note under a title",
      inputSchema: z.object({
        title: z.string().describe("The title to file the note under"),
        body: z.string().describe("The note itself"),
      }),
    },
    ({ title, body }) => {
      if (!title.trim()) {
        return {                   // A tool failure is a *result*, not an error
          content: [{ type: "text", text: "Title cannot be empty." }],
          isError: true,           // so the model can read it and try again.
        };
      }

      NOTES.set(title, body);

      return { content: [{ type: "text", text: `Saved "${title}".` }] };
    },
  );

  server.registerResource(
    "note",
    new ResourceTemplate("notes://{title}", { list: undefined }),
    { title: "Note", description: "One saved note", mimeType: "text/plain" },
    (uri, { title }) => ({
      contents: [{ uri: uri.href, text: NOTES.get(String(title)) ?? "" }],
    }),
  );

  server.registerPrompt(
    "summarize_note",
    {
      description: "Ask a model to summarize a saved note",
      argsSchema: z.object({ title: z.string() }),
    },
    ({ title }) => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Summarize this note:\n\n${NOTES.get(title) ?? ""}`,
        },
      }],
    }),
  );

  return server;
});
