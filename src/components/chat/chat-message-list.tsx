import { Skeleton } from "@/components/ui/skeleton";
import { formatChatTimestamp } from "@/lib/chat-time";
import type { ChatMessage } from "@/lib/types";

const SKELETON_ROWS = [
  { align: "start", width: "w-[74%]", lines: "h-10" },
  { align: "end", width: "w-[62%]", lines: "h-10" },
  { align: "start", width: "w-[80%]", lines: "h-16" },
  { align: "end", width: "w-[55%]", lines: "h-10" },
  { align: "start", width: "w-[68%]", lines: "h-10" },
  { align: "end", width: "w-[70%]", lines: "h-16" },
] as const;

export function ChatMessageListSkeleton() {
  return (
    <div className="flex h-full flex-col justify-end space-y-3" aria-hidden="true">
      {SKELETON_ROWS.map((row, index) => (
        <div
          key={index}
          className={`flex ${row.align === "end" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] ${row.width} space-y-2 ${
              row.align === "end"
                ? "rounded-2xl border border-white/10 bg-[#1c222c] px-4 py-3"
                : "py-1"
            }`}
          >
            <Skeleton className={`${row.lines} w-full`} />
            <Skeleton className={`h-3 w-16 ${row.align === "end" ? "ml-auto" : ""}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

type ChatMessageListProps = {
  messages: ChatMessage[];
  timeZone: string;
  nowIso: string;
  waiting?: boolean;
};

function MessageBubble({
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
          isUser ? "rounded-2xl border border-white/10 bg-[#1c222c] px-4 py-3" : "py-1"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-200">
          {message.content}
        </p>
        <p className={`mt-2 text-xs text-zinc-500 ${isUser ? "text-right" : "text-left"}`}>
          {formatChatTimestamp(timeZone, message.createdAt, new Date(nowIso))}
        </p>
      </div>
    </article>
  );
}

function WaitingBubble() {
  return (
    <div className="flex justify-start" aria-live="polite">
      <div className="inline-flex max-w-[85%] items-center gap-3 py-1">
        <span className="inline-flex h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-600 border-t-[#9ec9e8]" />
        <p className="text-sm text-zinc-400">Logging…</p>
      </div>
    </div>
  );
}

export function ChatMessageList({
  messages,
  timeZone,
  nowIso,
  waiting = false,
}: ChatMessageListProps) {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} timeZone={timeZone} nowIso={nowIso} />
      ))}
      {waiting ? <WaitingBubble /> : null}
    </div>
  );
}
