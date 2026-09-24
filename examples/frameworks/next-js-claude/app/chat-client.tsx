"use client";
 
import { useState } from "react";
 
export function ChatClient() {
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<"idle" | "streaming" | "failed">("idle");
 
  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
 
    const prompt = new FormData(event.currentTarget).get("prompt");
 
    setAnswer("");
    setState("streaming");
 
    const response = await fetch("/api/chat/stream", {
      method: "POST",                                  // `EventSource` only sends
      headers: { "content-type": "application/json" }, // GET, so the body is read
      body: JSON.stringify({ prompt }),                // by hand instead.
    });
 
    if (!response.ok || !response.body) {              // A failure before the stream
      setState("failed");                              // opened still has a status
      return;                                          // code worth believing.
    }
 
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
 
    while (true) {
      const { done, value } = await reader.read();
 
      if (done) {
        break;
      }
 
      buffer += decoder.decode(value, { stream: true });
 
      const frames = buffer.split("\n\n");             // A read can end mid-frame,
      buffer = frames.pop() ?? "";                     // so hold the tail back until
                                                       // its blank line arrives.
      for (const frame of frames) {
        const name = frame.match(/^event: (.*)$/m)?.[1] ?? "message";
        const data = frame.match(/^data: (.*)$/m)?.[1];
 
        if (!data) {
          continue;
        }
 
        if (name === "error") {                        // The stream already sent 200
          setState("failed");                          // and then failed. Without
          return;                                      // this, a failure looks like
        }                                              // a short, successful answer.
 
        if (name === "done") {
          setState("idle");
          return;
        }
 
        setAnswer((text) => text + JSON.parse(data).text);
      }
    }
 
    setState("idle");
  }
 
  const busy = state === "streaming";

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={send} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="prompt"
          placeholder="Ask Claude something"
          disabled={busy}
          className="flex-1 rounded-lg border border-black/[.08] px-4 py-2.5 text-black placeholder:text-zinc-400 disabled:opacity-50 dark:border-white/[.12] dark:text-zinc-50"
        />
        <button
          disabled={busy}
          className="rounded-lg bg-black px-5 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
        >
          {busy ? "Streaming…" : "Send"}
        </button>
      </form>

      {state === "failed" && (
        <p
          role="alert"
          className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-700 dark:text-red-400"
        >
          The server could not finish that answer.
        </p>
      )}

      {/* `whitespace-pre-wrap` is the one class here that is not decoration:
          the model's newlines are real characters, and HTML collapses them. */}
      <p className="whitespace-pre-wrap text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {answer}
        {busy && (
          <span className="ml-0.5 inline-block h-5 w-2 animate-pulse bg-current align-middle" />
        )}
      </p>
    </div>
  );
}
