"use client";

import { Modal } from "@/components/ui/modal";

type DeleteEventConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
};

export function DeleteEventConfirmModal({
  open,
  onClose,
  pending,
  error,
  onConfirm,
}: DeleteEventConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Delete event?" align="content">
      <div className="space-y-4">
        <p className="text-sm text-zinc-300">
          Delete this event permanently? This cannot be undone.
        </p>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Delete event"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
