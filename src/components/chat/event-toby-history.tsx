import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { formatChatTimestamp } from "@/lib/chat-time";
import type { ChatMessage } from "@/lib/types";

type EventTobyHistoryProps = {
  messages: ChatMessage[];
  timeZone: string;
  nowIso: string;
  hasMore: boolean;
  loading: boolean;
  loadingOlder: boolean;
  error?: string | null;
  onLoadOlder: () => void;
};

function HistoryMessage({
  message,
  timeZone,
  nowIso,
}: {
  message: ChatMessage;
  timeZone: string;
  nowIso: string;
}) {
  const isUser = message.role === "user";

  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] ${
          isUser ? "rounded-2xl border border-white/10 bg-[#1c222c] px-3 py-2" : "py-0.5"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-200">
            {message.content}
          </p>
        ) : (
          <ChatMarkdown content={message.content} />
        )}
        <p className={`mt-1.5 text-xs text-zinc-500 ${isUser ? "text-right" : "text-left"}`}>
          {formatChatTimestamp(timeZone, message.createdAt, new Date(nowIso))}
        </p>
      </div>
    </article>
  );
}

export function EventTobyHistory({
  messages,
  timeZone,
  nowIso,
  hasMore,
  loading,
  loadingOlder,
  error,
  onLoadOlder,
}: EventTobyHistoryProps) {
  if (loading) {
    return <p className="mb-3 text-sm text-zinc-500">Loading earlier updates…</p>;
  }

  return (
    <div className="mb-3">
      {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
      {hasMore ? (
        <div className="mb-2 flex justify-center">
          <button
            type="button"
            onClick={onLoadOlder}
            disabled={loadingOlder}
            className="text-sm text-zinc-500 transition hover:text-zinc-300 disabled:opacity-50"
          >
            {loadingOlder ? "Loading…" : "Load earlier"}
          </button>
        </div>
      ) : null}
      {messages.length === 0 && !error ? (
        <p className="text-sm text-zinc-500">No earlier updates yet.</p>
      ) : (
        <div className="max-h-[min(12rem,30dvh)] space-y-2 overflow-y-auto overscroll-contain">
          {messages.map((message) => (
            <HistoryMessage
              key={message.id}
              message={message}
              timeZone={timeZone}
              nowIso={nowIso}
            />
          ))}
        </div>
      )}
    </div>
  );
}
