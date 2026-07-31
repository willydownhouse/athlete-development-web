"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";

import { useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { createMetricDefinitionAction, type ActionState } from "@/app/admin/actions";
import { createValueTypeLabel } from "@/lib/i18n-labels";
import { METRIC_VALUE_TYPES, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type CreateMetricDefinitionFormProps = {
  sports: Sport[];
};

export function CreateMetricDefinitionForm({ sports }: CreateMetricDefinitionFormProps) {
  const t = useTranslations("admin.metricDefinitions");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const valueTypeLabel = createValueTypeLabel(tAdmin);
  const [state, formAction] = useActionState(createMetricDefinitionAction, initialState);
  const closeModal = useAdminCreateModalClose();

  useEffect(() => {
    if (state.success) {
      closeModal?.();
    }
  }, [state.success, closeModal]);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("key")}</span>
          <input
            name="key"
            required
            pattern="[a-z0-9_]+"
            placeholder={t("keyPlaceholder")}
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("name")}</span>
          <input
            name="name"
            required
            placeholder={t("namePlaceholder")}
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{t("valueType")}</span>
          <select name="valueType" required className={inputClassName}>
            {METRIC_VALUE_TYPES.map((valueType) => (
              <option key={valueType} value={valueType}>
                {valueTypeLabel(valueType)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{t("canonicalUnit")}</span>
          <input
            name="canonicalUnit"
            placeholder={t("unitPlaceholder")}
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("sport")}</span>
          <select name="sportId" defaultValue="" className={inputClassName}>
            <option value="general">{tCommon("generalAllSports")}</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-zinc-300">{tCommon("description")}</span>
        <textarea
          name="description"
          rows={2}
          placeholder={t("descriptionPlaceholder")}
          className={inputClassName}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="active"
          type="checkbox"
          defaultChecked
          className="rounded border-white/20 bg-[#1c222c]"
        />
        {tCommon("active")}
      </label>

      <SubmitButton>{t("createButton")}</SubmitButton>
    </form>
  );
}
