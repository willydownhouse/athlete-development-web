"use client";

import { Modal } from "@/components/ui/modal";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";

type RemoveAccessConfirmModalProps = {
  open: boolean;
  memberName: string;
  pending: boolean;
  isLeaving?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function RemoveAccessConfirmModal({
  open,
  memberName,
  pending,
  isLeaving = false,
  error,
  onClose,
  onConfirm,
}: RemoveAccessConfirmModalProps) {
  const messages = getMessages(useAppLocale());

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLeaving ? messages.access.leaveTitle : messages.access.removeTitle}
      align="content"
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-300">
          {isLeaving ? messages.access.leaveBody : messages.access.removeBody(memberName)}
        </p>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {messages.common.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? isLeaving
                ? messages.access.leaving
                : messages.access.removing
              : isLeaving
                ? messages.access.leave
                : messages.access.removeAccess}
          </button>
        </div>
      </div>
    </Modal>
  );
}
