"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useFormStatus } from "react-dom";

import { CHAT_MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/constants";

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
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="clientRequestId" defaultValue="" />
      <label htmlFor="chat-message" className="sr-only">
        Message
      </label>
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#1c222c] px-2 py-2 focus-within:border-[#9ec9e8] focus-within:ring-2 focus-within:ring-[#9ec9e8]/20">
        <textarea
          ref={textareaRef}
          id="chat-message"
          name="content"
          rows={1}
          maxLength={CHAT_MESSAGE_CONTENT_MAX_LENGTH}
          placeholder="Lisa had ice practice today at 2pm"
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
