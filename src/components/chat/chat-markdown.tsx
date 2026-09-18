import type { ReactNode } from "react";

import { parseChatMarkdown } from "@/lib/chat-markdown";

const CONTENT_CLASS = "whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-200";

export function ChatMarkdown({
  content,
  trailing,
  hiddenFromAT = false,
}: {
  content: string;
  trailing?: ReactNode;
  hiddenFromAT?: boolean;
}) {
  const segments = parseChatMarkdown(content);

  return (
    <p className={CONTENT_CLASS} aria-hidden={hiddenFromAT || undefined}>
      {segments.map((segment, index) => {
        if (segment.type === "strong") {
          return <strong key={index}>{segment.value}</strong>;
        }

        if (segment.type === "em") {
          return <em key={index}>{segment.value}</em>;
        }

        return <span key={index}>{segment.value}</span>;
      })}
      {trailing}
    </p>
  );
}
