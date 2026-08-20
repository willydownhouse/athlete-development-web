"use client";

import { useState } from "react";

import { DatePickerInput } from "@/components/date-picker-input";
import { Modal } from "@/components/ui/modal";
import { getZonedDateString } from "@/lib/time-zone";

type CopyEventsConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  timeZone: string;
  eventCount: number;
  pending: boolean;
  error: string | null;
  onConfirm: (targetDate: string) => void;
};

export function CopyEventsConfirmModal({
  open,
  onClose,
  timeZone,
  eventCount,
  pending,
  error,
  onConfirm,
}: CopyEventsConfirmModalProps) {
  const [targetDate, setTargetDate] = useState(() => getZonedDateString(timeZone));

  const title = eventCount === 1 ? "Copy event?" : "Copy day?";
  const description =
    eventCount === 1
      ? "Create a new event on the selected date with the same details?"
      : `Create ${eventCount} events on the selected date with the same details?`;

  return (
    <Modal open={open} onClose={onClose} title={title} align="content">
      <div className="space-y-4">
        <p className="text-sm text-zinc-300">{description}</p>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Copy to date</span>
          <DatePickerInput
            value={targetDate}
            onChange={setTargetDate}
            placeholder="Select date"
            className="w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20"
          />
        </label>

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
            onClick={() => onConfirm(targetDate)}
            disabled={pending || !targetDate}
            className="inline-flex items-center justify-center rounded-xl bg-[#9ec9e8] px-4 py-2.5 text-sm font-medium text-[#111827] transition hover:bg-[#b7d7ec] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Copying…" : "Yes, copy"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
