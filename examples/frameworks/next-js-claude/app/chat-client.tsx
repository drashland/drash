"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_MODEL, MODELS, type Model } from "./models";

type Turn = {
  role: "user" | "assistant";
  content: string;
  error?: string;                                      // "Not delivered", and why.
};                                                     // The server never stored it.

// One tab per resource. Both add to the same conversation on the server, so
// switching tabs partway through carries it over.
const ENDPOINTS = {
  "/api/chat": {
    summary: "Receive all text once the model has finished",
    explanation: (
      <>
        <p>
          The server asks Claude for the whole reply and waits. Only when the
          model has written its last word does the server answer, with one
          JSON body: <code>{`{"text": "..."}`}</code>.
        </p>
        <p>
          That makes the client simple: one <code>fetch</code>, one{" "}
          <code>response.json()</code>. The cost is the wait. Nothing appears
          until the reply is finished, and a long reply can take a minute.
        </p>
        <p>
          Failures are simple too. Nothing has been sent when something goes
          wrong, so the status code (400, 429, 500, 502) says exactly what
          happened.
        </p>
      </>
    ),
  },
  "/api/chat/stream": {
    summary: "Receive text as the model writes it",
    explanation: (
      <>
        <p>
          The server starts its response straight away and forwards each piece
          of text the moment Claude writes it, as a{" "}
          <em>server-sent event</em>: a <code>data:</code> line, then a blank
          line.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-black/[.05] p-3 text-xs dark:bg-white/[.08]">
          {`data: {"text":"Hel"}\n\ndata: {"text":"lo"}\n\nevent: done`}
        </pre>
        <p>
          The first words show up within a second or two and the reply grows as
          you watch. The page reads the body piece by piece and stitches the
          events back together, because a network read can stop in the middle
          of one.
        </p>
        <p>
          The trade-off: the <code>200</code> status goes out before Claude has
          written anything, so a failure partway through cannot change it. The
          server reports it inside the stream instead, as an{" "}
          <code>event: error</code>.
        </p>
      </>
    ),
  },
} as const;

type Endpoint = keyof typeof ENDPOINTS;

export function ChatClient() {
  const [endpoint, setEndpoint] = useState<Endpoint>("/api/chat");
  const [model, setModel] = useState<Model>(DEFAULT_MODEL);
  const [messages, setMessages] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [problem, setProblem] = useState("");
  const thread = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const learnMore = useRef<HTMLDialogElement>(null);
  const errorModal = useRef<HTMLDialogElement>(null);
  const startOverModal = useRef<HTMLDialogElement>(null);

  useEffect(() => {                                    // The server holds the
    fetch("/api/conversation")                         // conversation, so a reload
      .then((response) => response.json())             // picks up where it left off.
      .then((body: { messages: Turn[] }) => setMessages(body.messages))
      .catch(() => {})                                 // Nothing to restore; start
      .finally(() => setLoaded(true));                 // empty.
  }, []);

  useEffect(() => {                                    // Follow the newest bubble,
    const box = thread.current;                        // the way a messaging app
    box?.scrollTo({ top: box.scrollHeight });          // does. Only the thread
  }, [messages]);                                      // scrolls, not the page.

  const locked = busy || !loaded;                      // No sending until the saved
                                                       // thread arrives, or it would
                                                       // overwrite the new prompt.
  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const prompt = String(new FormData(form).get("prompt")).trim();

    if (!prompt || locked) {
      return;
    }

    form.reset();
    submit(prompt);
  }

  function retry(index: number) {                      // The server never stored the
    const prompt = messages[index].content;            // failed prompt, so sending it
                                                       // again is just sending it.
    setMessages((turns) => turns.filter((_, i) => i !== index));
    input.current?.focus();                            // The button is about to
    submit(prompt);                                    // disappear from under focus.
  }

  async function submit(prompt: string) {
    setMessages((turns) => [
      ...turns,
      { role: "user", content: prompt },
      { role: "assistant", content: "" },              // Where the reply lands.
    ]);
    setBusy(true);

    const fail = (reason: string) => {
      setMessages((turns) => [                         // Drop the half-written
        ...turns.slice(0, -2),                         // reply and mark the prompt,
        { ...turns[turns.length - 2], error: reason }, // like iMessage does.
      ]);
      setBusy(false);
      setProblem(reason);
      errorModal.current?.showModal();
    };

    const append = (text: string) => {
      setMessages((turns) => {                         // Add to the last bubble.
        const last = turns[turns.length - 1];          // The function form sees every
                                                       // earlier append, even ones
        return [                                       // that landed between renders.
          ...turns.slice(0, -1),
          { ...last, content: last.content + text },
        ];
      });
    };

    // Only the new prompt goes up. The server already has the rest, found by
    // the cookie the browser sends along with the request on its own.
    const response = await fetch(endpoint, {
      method: "POST",                                  // `EventSource` only sends
      headers: { "content-type": "application/json" }, // GET, so the stream is read
      body: JSON.stringify({ prompt, model }),         // by hand below instead.
    }).catch(() => null);

    if (!response) {
      fail("Could not reach the server. Check your connection and try again.");
      return;
    }

    if (!response.ok || !response.body) {              // A failure before the reply
      const reason = await response.text();            // started still has a status
      fail(reason || `Error ${response.status}`);      // code worth believing.
      return;
    }

    if (endpoint === "/api/chat") {                    // The whole reply, in one go.
      const { text } = await response.json();
      append(text);
      setBusy(false);
      return;
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
          fail(JSON.parse(data).message);              // and then failed. Without
          return;                                      // this, a failure looks like
        }                                              // a short, successful answer.

        if (name === "done") {
          setBusy(false);
          return;
        }

        append(JSON.parse(data).text);
      }
    }

    // The body ended without a `done` event, so the reply is not finished.
    fail("The connection closed before the reply finished.");
  }

  function confirmStartOver() {
    const dialog = startOverModal.current;

    if (!dialog) {
      return;
    }

    dialog.returnValue = "";                           // It keeps the last answer,
    dialog.showModal();                                // so a "yes" from before would
  }                                                    // count again on Escape.

  // Forgotten on the server first, then on screen.
  async function startOver() {
    await fetch("/api/conversation", { method: "DELETE" });
    setMessages([]);
    input.current?.focus();
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-3">
      <div
        role="tablist"
        className="flex gap-1 rounded-lg bg-black/[.05] p-1 dark:bg-white/[.08]"
      >
        {/* Locked while a reply is arriving, which is still being read from
            the endpoint it was sent to. */}
        {(Object.keys(ENDPOINTS) as Endpoint[]).map((path) => (
          <button
            key={path}
            role="tab"
            aria-selected={endpoint === path}
            disabled={busy}
            onClick={() => setEndpoint(path)}
            className={`rounded-md px-3 py-1.5 font-mono text-sm disabled:opacity-50 ${
              endpoint === path
                ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {path}
          </button>
        ))}
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {ENDPOINTS[endpoint].summary}.{" "}
        <button
          onClick={() => learnMore.current?.showModal()}
          className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Learn more
        </button>
      </p>

      {/* The box fills whatever space the window leaves, and the thread
          scrolls inside it, so a long conversation never pushes the input
          off the screen. */}
      <div className="flex min-h-0 w-full max-w-[650px] flex-1 flex-col overflow-hidden rounded-2xl border border-black/[.08] bg-white dark:border-white/[.12] dark:bg-black">
        <div className="flex items-center justify-between gap-2 border-b border-black/[.08] px-3 py-2 dark:border-white/[.12]">
          <select
            aria-label="Model"
            value={model}
            disabled={busy}
            onChange={(event) => setModel(event.target.value as Model)}
            className="rounded-md bg-transparent py-1 text-sm text-black disabled:opacity-50 dark:text-zinc-50"
          >
            {(Object.keys(MODELS) as Model[]).map((id) => (
              <option key={id} value={id}>
                {MODELS[id]}
              </option>
            ))}
          </select>
          <button
            onClick={confirmStartOver}
            disabled={locked || messages.length === 0}
            className="rounded-md px-2 py-1 text-sm text-blue-600 disabled:opacity-40 dark:text-blue-400"
          >
            Start new chat
          </button>
        </div>

        <div ref={thread} className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {messages.map((turn, index) => {
            const mine = turn.role === "user";
            const typing = busy && index === messages.length - 1;

            return (
              <div
                key={index}
                className={`flex max-w-[80%] flex-col gap-1 ${mine ? "items-end self-end" : "items-start self-start"}`}
              >
                {/* `whitespace-pre-wrap` is the one class here that is not
                    decoration: the model's newlines are real characters, and
                    HTML collapses them. */}
                <p
                  className={`whitespace-pre-wrap rounded-2xl px-4 py-2 leading-6 ${
                    mine
                      ? "rounded-br-md bg-blue-500 text-white"
                      : "rounded-bl-md bg-zinc-100 text-black dark:bg-zinc-800 dark:text-zinc-50"
                  }`}
                >
                  {turn.content}
                  {typing && (
                    <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-current align-middle" />
                  )}
                </p>
                {turn.error && (
                  <span className="flex gap-2 text-xs">
                    <span role="alert" className="text-red-600 dark:text-red-400">
                      Not delivered
                    </span>
                    <button
                      onClick={() => retry(index)}
                      disabled={locked}
                      className="font-medium text-blue-600 disabled:opacity-40 dark:text-blue-400"
                    >
                      Try again
                    </button>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* The input is never disabled. A disabled input drops focus, so the
            cursor would leave it on every send; only the button locks. */}
        <form
          onSubmit={send}
          className="flex gap-2 border-t border-black/[.08] p-3 dark:border-white/[.12]"
        >
          <input
            ref={input}
            name="prompt"
            placeholder="Ask Claude something"
            autoComplete="off"
            autoFocus
            className="min-w-0 flex-1 rounded-full border border-black/[.08] px-4 py-2 text-black placeholder:text-zinc-400 dark:border-white/[.12] dark:text-zinc-50"
          />
          <button
            disabled={locked}
            className="rounded-full bg-black px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
          >
            {busy ? "…" : "Send"}
          </button>
        </form>
      </div>

      <Modal ref={learnMore} title={endpoint} onClose={() => input.current?.focus()}>
        {ENDPOINTS[endpoint].explanation}
      </Modal>

      <Modal ref={errorModal} title="Not delivered" onClose={() => input.current?.focus()}>
        <p>{problem}</p>
        <p>Your message is still in the thread. Use Try again to send it again.</p>
      </Modal>

      {/* The button that closed the dialog leaves its `value` in
          `returnValue`. Cancel, Escape, and a backdrop click leave it empty. */}
      <Modal
        ref={startOverModal}
        title="Start new chat?"
        confirm="Start new chat"
        onClose={(event) =>
          event.currentTarget.returnValue === "confirm"
            ? startOver()
            : input.current?.focus()
        }
      >
        <p>
          This conversation will be deleted from the server. You cannot get it
          back.
        </p>
      </Modal>
    </div>
  );
}

// `<dialog>` with `showModal()` does the hard parts of a modal on its own: it
// sits above the page, blocks clicks behind it, keeps focus inside, and closes
// on Escape. A `<form method="dialog">` button closes it with no handler.
// Pass `confirm` to turn Close into Cancel plus a button that says yes.
function Modal({
  ref,
  title,
  confirm,
  onClose,
  children,
}: {
  ref: React.Ref<HTMLDialogElement>;
  title: string;
  confirm?: string;
  onClose: (event: React.SyntheticEvent<HTMLDialogElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {                            // A click on the backdrop
        if (event.target === event.currentTarget) {    // lands on the dialog itself,
          event.currentTarget.close();                 // not on anything inside it.
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-black backdrop:bg-black/40 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <div className="p-6">
        <h2 className="font-mono text-lg font-semibold">{title}</h2>
        <div className="mt-3 flex flex-col gap-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
        <form method="dialog" className="mt-5 flex justify-end gap-2">
          {confirm ? (
            <>
              <button className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Cancel
              </button>
              <button
                value="confirm"
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                {confirm}
              </button>
            </>
          ) : (
            <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black">
              Close
            </button>
          )}
        </form>
      </div>
    </dialog>
  );
}
