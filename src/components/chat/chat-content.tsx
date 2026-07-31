import { format } from "date-fns";

import type { Athlete } from "@/lib/types";

import { MOCK_CHAT_MESSAGES, type ChatMessage } from "./mock-data";

type ChatContentProps = {
  selectedAthlete: Athlete;
};

function formatMessageTime(isoDate: string): string {
  return format(new Date(isoDate), "h:mm a");
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[1.15rem] px-4 py-3 ${
          isUser ? "bg-[#b7d7ec] text-[#1a2430]" : "bg-[#1c2430] text-zinc-200"
        }`}
      >
        <p className="text-[15px] leading-relaxed">{message.content}</p>
        <p
          className={`mt-2 text-xs ${isUser ? "text-[#1a2430]/70" : "text-zinc-500"}`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function ChatContent({ selectedAthlete }: ChatContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0">
        <p className="text-sm text-zinc-400">Chat</p>
        <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
          {selectedAthlete.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Log training, ask questions, and get development guidance.
        </p>
      </header>

      <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-2">
          {MOCK_CHAT_MESSAGES.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
        </div>

        <div className="shrink-0 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-3">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="chat-input"
              rows={1}
              disabled
              placeholder="Message your coach…"
              title="Messaging is not available yet"
              className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-[15px] text-zinc-200 placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              disabled
              title="Messaging is not available yet"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#b7d7ec] px-4 text-sm font-semibold text-[#1a2430] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
