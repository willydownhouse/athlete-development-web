"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useFormStatus } from "react-dom";

import { CHAT_MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/constants";
import { chatEventLoggingExample } from "@/lib/chat-intro";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";

function ChatSendButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  const messages = getMessages(useAppLocale());

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-label={pending ? messages.chat.sending : messages.chat.send}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#b7d7ec] text-[#1a2430] transition hover:bg-[#c5dff0] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? <SendPendingIcon /> : <SendIcon />}
    </button>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />
    </svg>
  );
}

function SendPendingIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" d="M12 3.5a8.5 8.5 0 1 1-7.4 4.3" />
    </svg>
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
  examplePlaceholder,
  eventId,
  athleteId,
  messageFieldId = "chat-message",
  hideFieldLabel = false,
  formClassName = "shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
  onSend,
}: ChatComposerProps) {
  const locale = useAppLocale();
  const messages = getMessages(locale);
  const placeholder = examplePlaceholder ?? chatEventLoggingExample("", locale);
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
          {messages.chat.message}
        </label>
      )}
      <div className="flex items-end gap-2 rounded-2xl bg-[#1c222c] px-2 py-2 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#9ec9e8]/20">
        <textarea
          ref={textareaRef}
          id={messageFieldId}
          name="content"
          rows={1}
          maxLength={CHAT_MESSAGE_CONTENT_MAX_LENGTH}
          placeholder={placeholder}
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
