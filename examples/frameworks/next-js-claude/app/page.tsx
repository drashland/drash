import { ChatClient } from "./chat-client";

// A server component. It renders on the server and ships no JavaScript of its
// own, so nothing here is reachable from the browser.
export default function ChatPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-6 font-sans dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Chat with Claude
        </h1>
        <ChatClient />
      </main>
    </div>
  );
}
