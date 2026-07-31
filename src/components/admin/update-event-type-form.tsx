"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateEventTypeAction, type ActionState } from "@/app/admin/actions";
import { createCategoryLabel } from "@/lib/i18n-labels";
import { EVENT_CATEGORIES, type EventType, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type UpdateEventTypeFormProps = {
  eventType: EventType;
  sports: Sport[];
};

export function UpdateEventTypeForm({ eventType, sports }: UpdateEventTypeFormProps) {
  const t = useTranslations("admin.eventTypes");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const categoryLabel = createCategoryLabel(tAdmin);
  const [state, formAction] = useActionState(updateEventTypeAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventTypeId" value={eventType.id} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("slug")}</span>
          <input
            name="slug"
            required
            defaultValue={eventType.slug}
            pattern="[a-z0-9_]+"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("name")}</span>
          <input name="name" required defaultValue={eventType.name} className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("category")}</span>
          <select name="category" defaultValue={eventType.category} className={inputClassName}>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("sport")}</span>
          <select
            name="sportId"
            defaultValue={eventType.sportId ?? "general"}
            className={inputClassName}
          >
            <option value="general">{tCommon("generalAllSports")}</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="active" value="false" />
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="active"
          type="checkbox"
          value="true"
          defaultChecked={eventType.active}
          className="rounded border-white/20 bg-[#1c222c]"
        />
        {tCommon("active")}
      </label>

      <SubmitButton>{t("saveButton")}</SubmitButton>
    </form>
  );
}
