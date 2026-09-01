"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { SubmitButton } from "@/components/admin/submit-button";
import { CHAT_MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/constants";

const textareaClassName =
  "max-h-40 min-h-12 w-full resize-none rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

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
      className="shrink-0 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="clientRequestId" defaultValue="" />
      <label htmlFor="chat-message" className="sr-only">
        Message
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
          className={textareaClassName}
        />
        <SubmitButton
          disabled={disabled || !content.trim()}
          pending={isPending}
          pendingLabel="Sending…"
          className="sm:w-auto"
        >
          Send
        </SubmitButton>
      </div>
    </form>
  );
}
