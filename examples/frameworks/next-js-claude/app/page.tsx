import { ChatClient } from "./chat-client";

// A server component. It renders on the server and ships no JavaScript of its
// own, so nothing here is reachable from the browser.
export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-10 bg-white px-6 py-16 dark:bg-black sm:px-16 sm:py-24">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Chat
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Answers arrive from Claude one piece at a time, over a stream this
            page reads by hand.
          </p>
        </div>
        <ChatClient />
      </main>
    </div>
  );
}
