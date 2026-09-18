"use client";

import { FormSelect, type FormSelectOption } from "@/components/form/form-select";
import { formatCategoryLabel, type EventCategory, type Sport } from "@/lib/types";

const adminSelectClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type AdminFormSelectProps = {
  name?: string;
  options: FormSelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

export function AdminFormSelect({ className = "", ...props }: AdminFormSelectProps) {
  return <FormSelect {...props} className={`${adminSelectClassName} ${className}`.trim()} />;
}

export const ACTIVE_FILTER_OPTIONS: FormSelectOption[] = [
  { value: "", label: "All" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function sportFilterOptions(sports: Sport[]): FormSelectOption[] {
  return [
    { value: "", label: "All sports" },
    ...sports.map((sport) => ({ value: sport.id, label: sport.name })),
  ];
}

export function sportScopeOptions(sports: Sport[]): FormSelectOption[] {
  return [
    { value: "general", label: "General (all sports)" },
    ...sports.map((sport) => ({ value: sport.id, label: sport.name })),
  ];
}

export function eventCategoryOptions(categories: readonly EventCategory[]): FormSelectOption[] {
  return categories.map((category) => ({
    value: category,
    label: formatCategoryLabel(category),
  }));
}
