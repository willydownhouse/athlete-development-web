"use client";

import { format } from "date-fns";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createEventAction,
  deleteEventAction,
  updateEventAction,
  type DashboardActionState,
} from "@/app/dashboard/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { EventTypeMetricsSection } from "@/components/dashboard/event-metric-fields";
import { DatePickerInput } from "@/components/date-picker-input";
import { DurationPartsFields } from "@/components/form/duration-parts-fields";
import { FormSelect } from "@/components/form/form-select";
import { OptionPills } from "@/components/form/option-pills";
import { TimePickerInput } from "@/components/time-picker-input";
import { groupEventTypes } from "@/lib/event-type-groups";
import { defaultCreateFormValues, eventToFormValues } from "@/lib/event-form-values";
import { EVENT_DURATION_FIELDS } from "@/lib/event-metric-form";
import {
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  getEventFormValidationError,
} from "@/lib/event-form-schema";
import type { Event, EventType, EventTypeMetricDefinition } from "@/lib/types";

const initialState: DashboardActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

const INTENSITY_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
] as const;

export type EventFormApplyHandlers = {
  applyEventType: (eventTypeId: string) => void;
  applyDate: (eventDate: string) => void;
};

type EventFormProps = {
  athleteId: string;
  eventTypes: EventType[];
  focusSportName: string;
  event?: Event;
  defaultEventTypeId?: string;
  defaultEventDate?: string;
  onApplyHandlersReady?: (handlers: EventFormApplyHandlers) => void;
  onSuccess?: () => void;
  onDeleteSuccess?: () => void;
  deleteRedirectTo?: string;
};

function DeleteConfirmActions({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
      >
        {pending ? "Deleting…" : "Delete event"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onCancel}
        className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
      >
        Cancel
      </button>
    </div>
  );
}

export function EventForm({
  athleteId,
  eventTypes,
  focusSportName,
  event,
  defaultEventTypeId,
  defaultEventDate,
  onApplyHandlersReady,
  onSuccess,
  onDeleteSuccess,
  deleteRedirectTo,
}: EventFormProps) {
  const isEdit = event !== undefined;
  const isCreate = !isEdit;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction] = useActionState(
    isEdit ? updateEventAction : createEventAction,
    initialState,
  );
  const [deleteState, deleteFormAction] = useActionState(deleteEventAction, initialState);
  const groups = useMemo(
    () => groupEventTypes(eventTypes, focusSportName),
    [eventTypes, focusSportName],
  );
  const values = useMemo(
    () =>
      event
        ? eventToFormValues(event)
        : defaultCreateFormValues(
            defaultEventTypeId,
            defaultEventDate ?? format(new Date(), "yyyy-MM-dd"),
          ),
    [event, defaultEventTypeId, defaultEventDate],
  );
  const [eventTypeId, setEventTypeId] = useState(values.eventTypeId);
  const [eventDate, setEventDate] = useState(values.eventDate);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState(values.eventTypeId);
  const [metricMappings, setMetricMappings] = useState<EventTypeMetricDefinition[]>([]);
  const [metricFieldsResetKey, setMetricFieldsResetKey] = useState(values.eventTypeId || "initial");

  const handleEventTypeChange = useCallback((nextEventTypeId: string) => {
    setEventTypeId(nextEventTypeId);
    setSelectedEventTypeId(nextEventTypeId);
    setMetricFieldsResetKey(nextEventTypeId || "initial");

    if (!nextEventTypeId) {
      setMetricMappings([]);
    }
  }, []);

  const applyDate = useCallback((nextEventDate: string) => {
    setEventDate(nextEventDate);
  }, []);

  useEffect(() => {
    if (!isCreate || !onApplyHandlersReady) {
      return;
    }

    onApplyHandlersReady({
      applyEventType: handleEventTypeChange,
      applyDate,
    });
  }, [applyDate, handleEventTypeChange, isCreate, onApplyHandlersReady]);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  useEffect(() => {
    if (deleteState.success) {
      (onDeleteSuccess ?? onSuccess)?.();
    }
  }, [deleteState.success, onDeleteSuccess, onSuccess]);

  if (eventTypes.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        No event types are available yet. Ask an admin to configure event types first.
      </p>
    );
  }

  return (
    <>
      <form
        action={formAction}
        className="space-y-4"
        onSubmit={(submitEvent) => {
          const error = getEventFormValidationError(
            new FormData(submitEvent.currentTarget),
            metricMappings,
          );

          if (error) {
            submitEvent.preventDefault();
            setClientError(error);
            return;
          }

          setClientError(null);
        }}
      >
        <input type="hidden" name="athleteId" value={athleteId} />
        {isEdit ? <input type="hidden" name="eventId" value={event.id} /> : null}
        <FormMessage
          error={clientError ?? state.error ?? deleteState.error}
          success={state.success}
        />

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Event type</span>
          <FormSelect
            name="eventTypeId"
            placeholder="Select event type"
            className={inputClassName}
            {...(isCreate
              ? { value: eventTypeId, onValueChange: handleEventTypeChange }
              : { defaultValue: values.eventTypeId, onValueChange: handleEventTypeChange })}
            groups={groups.map((group) => ({
              label: group.label,
              options: group.items.map((eventType) => ({
                value: eventType.id,
                label: eventType.name,
              })),
            }))}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-300">Date</span>
            <DatePickerInput
              name="eventDate"
              {...(isCreate
                ? { value: eventDate, onChange: setEventDate }
                : { defaultValue: values.eventDate })}
              placeholder="Select date"
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-300">Start time</span>
            <TimePickerInput
              name="eventTime"
              defaultValue={values.eventTime}
              placeholder="Select time"
              className={inputClassName}
            />
            <span className="text-xs text-zinc-500">Leave empty to default to noon.</span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DurationPartsFields
            hoursName={EVENT_DURATION_FIELDS.hours}
            minutesName={EVENT_DURATION_FIELDS.minutes}
            secondsName={EVENT_DURATION_FIELDS.seconds}
            defaultHours={values.durationHours}
            defaultMinutes={values.durationMinutes}
            defaultSeconds={values.durationSeconds}
            label="Duration"
            inputClassName={inputClassName}
          />

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-zinc-300">Intensity</span>
            <OptionPills
              name="intensity"
              options={[...INTENSITY_OPTIONS]}
              defaultValue={values.intensity}
            />
          </div>
        </div>

        {selectedEventTypeId ? (
          <EventTypeMetricsSection
            key={selectedEventTypeId}
            eventTypeId={selectedEventTypeId}
            savedMetrics={
              isEdit && selectedEventTypeId === event.eventTypeId ? event.metrics : undefined
            }
            fieldsResetKey={`${metricFieldsResetKey}-${isEdit ? event.id : "create"}`}
            onMappingsChange={setMetricMappings}
          />
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Title</span>
          <input
            name="title"
            defaultValue={values.title}
            placeholder="Morning ice practice"
            className={inputClassName}
          />
          <span className="text-xs text-zinc-500">Max {EVENT_TITLE_MAX_LENGTH} characters</span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Notes</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={values.description}
            placeholder="Edge work, small-area games, felt pretty hard."
            className={`${inputClassName} resize-y`}
          />
          <span className="text-xs text-zinc-500">
            Max {EVENT_DESCRIPTION_MAX_LENGTH} characters
          </span>
        </label>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
          <SubmitButton>{isEdit ? "Save changes" : "Add event"}</SubmitButton>
        </div>
      </form>

      {isEdit ? (
        <form action={deleteFormAction} className="mt-5 border-t border-white/10 pt-5">
          <input type="hidden" name="athleteId" value={athleteId} />
          <input type="hidden" name="eventId" value={event.id} />
          {deleteRedirectTo ? (
            <input type="hidden" name="redirectTo" value={deleteRedirectTo} />
          ) : null}

          {deleteConfirmOpen ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                Delete this event permanently? This cannot be undone.
              </p>
              <DeleteConfirmActions onCancel={() => setDeleteConfirmOpen(false)} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-sm font-medium text-red-300 transition hover:text-red-200"
            >
              Delete event
            </button>
          )}
        </form>
      ) : null}
    </>
  );
}
