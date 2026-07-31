"use client";

import { format } from "date-fns";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

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
import { FormSelect } from "@/components/form/form-select";
import { OptionPills } from "@/components/form/option-pills";
import { TimePickerInput } from "@/components/time-picker-input";
import { defaultCreateFormValues, eventToFormValues } from "@/lib/event-form-values";
import {
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  getEventFormValidationError,
} from "@/lib/event-form-schema";
import type { Event, EventType, EventTypeMetricDefinition } from "@/lib/types";
import { createValidationMessages } from "@/lib/validation-messages";

const initialState: DashboardActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type EventFormProps = {
  athleteId: string;
  eventTypes: EventType[];
  event?: Event;
  defaultEventTypeId?: string;
  defaultEventDate?: string;
  onSuccess?: () => void;
};

type EventTypeGroup = {
  label: string;
  items: EventType[];
};

function groupEventTypes(
  eventTypes: EventType[],
  hockeyLabel: string,
  generalLabel: string,
): EventTypeGroup[] {
  const general = eventTypes
    .filter((eventType) => eventType.sportId === null)
    .sort((a, b) => a.name.localeCompare(b.name));
  const hockey = eventTypes
    .filter((eventType) => eventType.sport?.slug === "hockey")
    .sort((a, b) => a.name.localeCompare(b.name));

  const groups: EventTypeGroup[] = [];

  if (hockey.length > 0) {
    groups.push({ label: hockeyLabel, items: hockey });
  }

  if (general.length > 0) {
    groups.push({ label: generalLabel, items: general });
  }

  return groups;
}

function DeleteConfirmActions({
  onCancel,
  deletingLabel,
  deleteLabel,
  cancelLabel,
}: {
  onCancel: () => void;
  deletingLabel: string;
  deleteLabel: string;
  cancelLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
      >
        {pending ? deletingLabel : deleteLabel}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onCancel}
        className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
      >
        {cancelLabel}
      </button>
    </div>
  );
}

export function EventForm({
  athleteId,
  eventTypes,
  event,
  defaultEventTypeId,
  defaultEventDate,
  onSuccess,
}: EventFormProps) {
  const t = useTranslations("events.form");
  const tForm = useTranslations("form");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const validationMessages = useMemo(() => createValidationMessages(tValidation), [tValidation]);

  const isEdit = event !== undefined;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction] = useActionState(
    isEdit ? updateEventAction : createEventAction,
    initialState,
  );
  const [deleteState, deleteFormAction] = useActionState(deleteEventAction, initialState);
  const groups = useMemo(
    () => groupEventTypes(eventTypes, t("groups.hockey"), t("groups.general")),
    [eventTypes, t],
  );
  const intensityOptions = useMemo(
    () => [
      { value: "", label: t("intensity.notSet") },
      { value: "light", label: t("intensity.light") },
      { value: "moderate", label: t("intensity.moderate") },
      { value: "hard", label: t("intensity.hard") },
    ],
    [t],
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
  const [selectedEventTypeId, setSelectedEventTypeId] = useState(values.eventTypeId);
  const [metricMappings, setMetricMappings] = useState<EventTypeMetricDefinition[]>([]);
  const [metricFieldsResetKey, setMetricFieldsResetKey] = useState(values.eventTypeId || "initial");

  function handleEventTypeChange(nextEventTypeId: string) {
    setSelectedEventTypeId(nextEventTypeId);
    setMetricFieldsResetKey(nextEventTypeId || "initial");

    if (!nextEventTypeId) {
      setMetricMappings([]);
    }
  }

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  useEffect(() => {
    if (deleteState.success) {
      onSuccess?.();
    }
  }, [deleteState.success, onSuccess]);

  if (eventTypes.length === 0) {
    return <p className="text-sm text-zinc-400">{t("noEventTypes")}</p>;
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
            validationMessages,
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
          <span className="font-medium text-zinc-300">{t("eventType")}</span>
          <FormSelect
            name="eventTypeId"
            placeholder={t("selectEventType")}
            className={inputClassName}
            defaultValue={values.eventTypeId}
            onValueChange={handleEventTypeChange}
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
            <span className="font-medium text-zinc-300">{t("date")}</span>
            <DatePickerInput
              name="eventDate"
              defaultValue={values.eventDate}
              placeholder={tForm("selectDate")}
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-300">{t("startTime")}</span>
            <TimePickerInput
              name="eventTime"
              defaultValue={values.eventTime}
              placeholder={tForm("selectTime")}
              className={inputClassName}
            />
            <span className="text-xs text-zinc-500">{t("startTimeHint")}</span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-300">{t("durationMinutes")}</span>
            <input
              name="durationMinutes"
              type="number"
              min={1}
              defaultValue={values.durationMinutes}
              placeholder={t("durationPlaceholder")}
              className={inputClassName}
            />
          </label>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-zinc-300">{t("intensityLabel")}</span>
            <OptionPills
              name="intensity"
              options={intensityOptions}
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
          <span className="font-medium text-zinc-300">{t("title")}</span>
          <input
            name="title"
            defaultValue={values.title}
            placeholder={t("titlePlaceholder")}
            className={inputClassName}
          />
          <span className="text-xs text-zinc-500">
            {tCommon("maxCharacters", { max: EVENT_TITLE_MAX_LENGTH })}
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">{t("notes")}</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={values.description}
            placeholder={t("notesPlaceholder")}
            className={`${inputClassName} resize-y`}
          />
          <span className="text-xs text-zinc-500">
            {tCommon("maxCharacters", { max: EVENT_DESCRIPTION_MAX_LENGTH })}
          </span>
        </label>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
          <SubmitButton>{isEdit ? tCommon("saveChanges") : t("addButton")}</SubmitButton>
        </div>
      </form>

      {isEdit ? (
        <form action={deleteFormAction} className="mt-5 border-t border-white/10 pt-5">
          <input type="hidden" name="athleteId" value={athleteId} />
          <input type="hidden" name="eventId" value={event.id} />

          {deleteConfirmOpen ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">{t("deleteConfirm")}</p>
              <DeleteConfirmActions
                onCancel={() => setDeleteConfirmOpen(false)}
                deletingLabel={tCommon("deleting")}
                deleteLabel={t("deleteButton")}
                cancelLabel={tCommon("cancel")}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-sm font-medium text-red-300 transition hover:text-red-200"
            >
              {t("deleteButton")}
            </button>
          )}
        </form>
      ) : null}
    </>
  );
}
