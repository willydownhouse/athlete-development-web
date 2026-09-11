"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useFormStatus } from "react-dom";

import { CHAT_MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/constants";
import { chatEventLoggingExample } from "@/lib/chat-intro";

function ChatSendButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#b7d7ec] px-3 py-2 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send"}
    </button>
  );
}

type ChatComposerProps = {
  threadId: string;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  disabled?: boolean;
  examplePlaceholder?: string;
  eventId?: string;
  athleteId?: string;
  messageFieldId?: string;
  hideFieldLabel?: boolean;
  formClassName?: string;
  onSend?: (payload: { content: string; clientRequestId: string }) => void;
};

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
}

export function ChatComposer({
  threadId,
  formAction,
  isPending,
  disabled = false,
  examplePlaceholder = chatEventLoggingExample(""),
  eventId,
  athleteId,
  messageFieldId = "chat-message",
  hideFieldLabel = false,
  formClassName = "shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
  onSend,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      resizeTextarea(textarea);
    }
  }, [content]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const trimmed = content.trim();

    if (disabled || isPending || !trimmed) {
      event.preventDefault();
      return;
    }

    const idInput = event.currentTarget.elements.namedItem("clientRequestId");
    if (!(idInput instanceof HTMLInputElement)) {
      event.preventDefault();
      return;
    }

    if (!idInput.value) {
      idInput.value = crypto.randomUUID();
    }

    onSend?.({ content: trimmed, clientRequestId: idInput.value });
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className={formClassName}>
      <input type="hidden" name="threadId" value={threadId} />
      {eventId ? <input type="hidden" name="eventId" value={eventId} /> : null}
      {athleteId ? <input type="hidden" name="athleteId" value={athleteId} /> : null}
      <input type="hidden" name="clientRequestId" defaultValue="" />
      {hideFieldLabel ? null : (
        <label htmlFor={messageFieldId} className="sr-only">
          Message
        </label>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#1c222c] px-2 py-2 focus-within:border-[#9ec9e8] focus-within:ring-2 focus-within:ring-[#9ec9e8]/20">
        <textarea
          ref={textareaRef}
          id={messageFieldId}
          name="content"
          rows={1}
          maxLength={CHAT_MESSAGE_CONTENT_MAX_LENGTH}
          placeholder={examplePlaceholder}
          value={content}
          disabled={disabled || isPending}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-40 min-h-10 w-full resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        />
        <ChatSendButton disabled={disabled || isPending || !content.trim()} />
      </div>
    </form>
  );
}
