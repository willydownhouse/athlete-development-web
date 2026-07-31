import type { EventCategory, OnboardingAnswerType } from "./types";

type AnyTranslator = (key: never) => string;

export function createCategoryLabel(t: AnyTranslator) {
  return (category: EventCategory) => t(`enums.eventCategory.${category}` as never);
}

export function createAnswerTypeLabel(t: AnyTranslator) {
  return (answerType: OnboardingAnswerType) => t(`enums.answerType.${answerType}` as never);
}

export function createValueTypeLabel(t: AnyTranslator) {
  return (valueType: "number" | "text" | "boolean") => t(`enums.valueType.${valueType}` as never);
}
